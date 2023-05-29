import {
	faCopy,
	faDownload,
	faFloppyDisk,
	faTrash
} from '@fortawesome/free-solid-svg-icons';
import cls from 'classnames';
import { groupBy } from 'lodash-es';
import { useForm } from 'react-hook-form';
import { v4 } from 'uuid';

import turtleSpecs from './assets/talents.json';
import Icon from './components/Icon';
import IconButton from './components/IconButton';
import ConfirmDialog from './ConfirmDialog';
import IconPicker from './form/IconPicker';
import Input from './form/Input';
import useLocalStorage from './hooks/useLocalStorage';
import ImportDialog from './ImportDialog';
import TalentEdit from './TalentEdit';
import { type TalentFormT, type TalentT, TalentForm } from './types';
import { downloadBlob, zodResolver } from './utils';

const getSpecs = () => {
	try {
		const v = localStorage.getItem('saved-specs');
		if (v) return JSON.parse(v) as Record<string, Required<TalentFormT>>;
	} catch (e) {
		console.error(e);
	}
	return {};
};

const getInitialTree = () =>
	Object.values(getSpecs())?.[0] ?? {
		id: v4(),
		icon: 'inv_misc_questionmark',
		name: 'Unnamed',
		selected: undefined,
		tree: [...Array(4 * 7).keys()].map(() => ({} as TalentT))
	};

const initialTree = getInitialTree();

const App = () => {
	const { handleSubmit, register, watch, setValue, getValues, reset } = useForm(
		{
			defaultValues: initialTree,
			resolver: zodResolver(TalentForm)
		}
	);

	const selected = watch('selected');
	const tree = watch('tree');

	const [savedSpecs, setSavedSpecs] = useLocalStorage<
		Record<string, TalentFormT>
	>('saved-specs', {});

	// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
	const pointCount = tree.reduce((p, n) => p + (n?.ranks || 0), 0);

	const isSaved = !!savedSpecs[watch('id')];

	return (
		<div className="h-[100vh] overflow-auto  bg-zinc-800 text-zinc-400 py-12">
			<form
				onSubmit={handleSubmit(v => console.log(v))}
				className="flex flex-col gap-8 max-w-screen-xl mx-auto"
			>
				<h1 className="font-bold text-center text-4xl">Talent Builder</h1>
				<div className="flex gap-4 flex-col md:flex-row items-center bg-zinc-900 p-4">
					<div className="flex gap-4 flex-grow items-center">
						<IconPicker icon={watch('icon')} inputProps={register('icon')} />
						<Input {...register('name')} className="text-3xl" />
					</div>
					<p>
						Total points: <span>{pointCount}</span>
					</p>
					<div className="flex items-center button-group">
						<IconButton
							onClick={() => {
								const values = getValues();
								setSavedSpecs(p => ({ ...p, [values.id]: values }));
							}}
							icon={faFloppyDisk}
							title="Save"
							dark
						/>
						{isSaved && (
							<IconButton
								onClick={() => {
									const values = getValues();
									const newId = v4();
									setSavedSpecs(p => ({
										...p,
										[newId]: { ...values, id: newId }
									}));
								}}
								icon={faCopy}
								title="Save as copy"
								dark
							/>
						)}
						<ImportDialog onSubmit={reset} />
						<IconButton
							onClick={() =>
								downloadBlob(
									new Blob([JSON.stringify(getValues())], {
										type: 'application/json'
									}),
									`${getValues()
										.name.toLocaleLowerCase()
										.replaceAll(' ', '_')}.json`
								)
							}
							icon={faDownload}
							title="Export"
							dark
						/>
						<ConfirmDialog
							title={`Are you sure you want to "${getValues().name}" tree?`}
							confirm={() => {
								const values = getValues();
								const { [values.id]: _, ...newSpecs } = savedSpecs;
								setSavedSpecs(newSpecs);
								reset(initialTree);
							}}
						>
							{open => (
								<IconButton
									onClick={open}
									icon={faTrash}
									title="Delete"
									className="text-red-500"
									dark
								/>
							)}
						</ConfirmDialog>
					</div>
				</div>
				<div className="flex flex-col md:flex-row gap-12 md:justify-center">
					<div className="grid grid-cols-[auto_auto_auto_auto] flex-grow self-center justify-center content-start gap-6 flex-shrink-0">
						{tree.map((t, i) => (
							<Icon
								key={i}
								onClick={() => setValue('selected', i)}
								icon={t.icon}
								ranks={t.ranks}
								title={`${t.name}:${t.description}`}
								highlight={selected === i}
								frameClass={cls({ 'opacity-10': !t.name })}
								className={cls({
									'after:absolute after:top-0 after:bottom-0 after:right-0 after:left-0 after:scale-125 after:bg-orange-300 after:blur after:rounded after:opacity-25':
										t.highlight,
									'invert':
										selected !== undefined && tree[selected].requires === i
								})}
								draggable
								onDragStart={e => e.dataTransfer.setData('text', i.toString())}
								onDragOver={e => e.preventDefault()}
								onDrop={e => {
									e.preventDefault();
									const idx = Number(e.dataTransfer.getData('text'));
									if (i === idx) return;
									const newTree = [...tree];
									[newTree[i], newTree[idx]] = [newTree[idx], newTree[i]];
									setValue('tree', newTree);
									setValue('selected', i);
								}}
							/>
						))}
					</div>
					{selected !== undefined ? (
						<TalentEdit
							key={selected}
							selected={selected}
							watch={watch}
							register={register}
							onDelete={() => {
								setValue(`tree.${selected}`, {
									icon: '',
									name: '',
									ranks: null,
									description: '',
									requires: null
								});
								setValue('selected', selected);
							}}
						/>
					) : (
						<div className="w-full md:max-w-md items-center flex flex-col justify-center">
							<p>Click on a talent to start editing it.</p>
							<p>You can also drag & drop to swap talents around.</p>
						</div>
					)}
				</div>
				<div className="flex flex-col gap-4">
					<h2 className="font-bold text-lg text-center">Saved specs</h2>
					<div className="flex gap-4 flex-wrap justify-center">
						{Object.values(savedSpecs).map(s => (
							<div
								key={s.id}
								className="flex flex-col w-[100px] py-3 bg-zinc-900 rounded"
							>
								<Icon
									icon={s.icon}
									showDefault
									onClick={() => reset(savedSpecs[s.id])}
									highlight={s.id === getValues().id}
									className="mx-auto"
								/>
								<p className="text-center truncate">{s.name}</p>
							</div>
						))}
					</div>
				</div>
				<div className="flex flex-col gap-4">
					<h2 className="font-bold text-lg text-center">TurtleWoW specs</h2>
					<div className="grid gap-4 grid-cols-[repeat(auto-fit,_minmax(auto,100px))] justify-center">
						{Object.values(
							groupBy(Object.values(turtleSpecs), s => s.class)
						).map((c, i) => (
							<div
								key={i}
								className="flex flex-col gap-2 py-3 bg-zinc-900 rounded"
							>
								{c.map(s => (
									<div key={s.id} className="flex flex-col w-[100px]">
										<Icon
											icon={s.icon}
											showDefault
											onClick={() => reset(s)}
											className="mx-auto"
										/>
										<p className="text-center truncate text-sm">{s.name}</p>
									</div>
								))}
							</div>
						))}
					</div>
				</div>
			</form>
		</div>
	);
};

export default App;
