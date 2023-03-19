import cls from 'classnames';
import { useForm } from 'react-hook-form';
import { v4 } from 'uuid';
import { z } from 'zod';

import turtleSpecs from './assets/talents.json';
import Button from './components/Button';
import Icon from './components/Icon';
import IconPicker from './form/IconPicker';
import Input from './form/Input';
import Textarea from './form/Textarea';
import useLocalStorage from './hooks/useLocalStorage';
import TalentEdit from './TalentEdit';
import { compressTree, decompressTree, zodResolver } from './utils';

const Talent = z.object({
	icon: z.string().optional(),
	name: z.string().optional(),
	ranks: z.number().min(1).max(5).optional(),
	description: z.string().optional(),
	requires: z.number().optional()
});
type TalentT = z.infer<typeof Talent>;

const TalentTree = z.array(Talent).length(4 * 7);
export type TalentTreeT = z.infer<typeof TalentTree>;

const TalentForm = z.object({
	id: z.string(),
	icon: z.string(),
	name: z.string(),
	tree: TalentTree,
	selected: z.number().optional()
});
export type TalentFormT = z.infer<typeof TalentForm>;

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

	const compressed = compressTree(getValues());

	// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
	const pointCount = tree.reduce((p, n) => p + (n?.ranks || 0), 0);

	return (
		<div className="h-[100vh] overflow-auto  bg-zinc-800 text-zinc-400 py-12">
			<form
				onSubmit={handleSubmit(v => console.log(v))}
				className="flex flex-col gap-8 max-w-screen-xl mx-auto px-12"
			>
				<h1 className="font-bold text-center text-4xl">Talent Builder</h1>
				<div className="flex gap-4 flex-col md:flex-row items-center">
					<div className="flex gap-4 flex-grow items-center">
						<IconPicker icon={watch('icon')} inputProps={register('icon')} />
						<Input {...register('name')} className="text-3xl" />
					</div>
					<p
						className={cls({
							['text-red-500']: pointCount !== 51,
							['text-green-500']: pointCount === 51
						})}
					>
						Total points: <span>{pointCount}</span>
					</p>
					<div className="flex gap-2 items-center">
						<Button
							onClick={() => {
								const values = getValues();
								setSavedSpecs(p => ({ ...p, [values.id]: values }));
							}}
						>
							Save
						</Button>
						<Button
							onClick={() => {
								const values = getValues();
								const newId = v4();
								setSavedSpecs(p => ({
									...p,
									[newId]: { ...values, id: newId }
								}));
							}}
						>
							Save as copy
						</Button>
						<Button
							onClick={() => {
								const values = getValues();
								const { [values.id]: _, ...newSpecs } = savedSpecs;
								setSavedSpecs(newSpecs);
							}}
						>
							Delete
						</Button>
					</div>
				</div>
				<div className="flex flex-col md:flex-row gap-12 md:justify-center">
					<div className="grid grid-cols-[auto_auto_auto_auto] self-center justify-items-center content-start gap-6 flex-shrink-0">
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
									invert:
										selected !== undefined && tree[selected].requires === i
								})}
							/>
						))}
					</div>
					{selected !== undefined && (
						<TalentEdit
							key={selected}
							selected={selected}
							watch={watch}
							register={register}
						/>
					)}
				</div>
				<details className="w-full">
					<summary className="py-4 cursor-pointer">Export/import</summary>

					<Textarea
						name="compressed"
						rows={8}
						value={compressed}
						onChange={e => reset(decompressTree(e.target.value))}
					/>
				</details>
				<div className="flex flex-col gap-4">
					<h2 className="font-bold text-lg">Saved specs</h2>
					<div className="flex gap-4 flex-wrap">
						{Object.values(savedSpecs).map(s => (
							<div key={s.id} className="flex flex-col w-[100px]">
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
					<h2 className="font-bold text-lg">TurtleWoW specs</h2>
					<div className="flex gap-4 flex-wrap">
						{Object.entries(turtleSpecs).map(([id, s]) => (
							<div key={id} className="flex flex-col w-[100px]">
								<Icon
									icon={s.icon}
									showDefault
									onClick={() => reset(s)}
									className="mx-auto"
								/>
								<p className="text-center truncate">{s.name}</p>
							</div>
						))}
					</div>
				</div>
			</form>
		</div>
	);
};

export default App;
