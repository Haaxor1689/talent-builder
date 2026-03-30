'use client';

import { Camera, CloudOff, Eye, EyeOff, NotebookPen } from 'lucide-react';
import { useRef, useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';

import { useSession } from '#auth/client.ts';
import ScrollArea from '#components/styled/ScrollArea.tsx';
import { UserAvatar, UserRoleText } from '#components/styled/User.tsx';
import { TalentForm } from '#server/schemas.ts';
import { elementToPng, zodResolver } from '#utils/index.ts';

import UndoRedo from '../form/UndoRedo';
import TextButton from '../styled/TextButton';
import Notes from './Notes';
import PointsSummary from './PointsSummary';
import TalentEdit from './TalentEdit';
import TalentPreview from './TalentPreview';
import TopBar from './TopBar';

type Props = { defaultValues: TalentForm };

const TalentBuilder = ({ defaultValues }: Props) => {
	const treeElemRef = useRef<HTMLDivElement>(null);

	const session = useSession();

	const isLocal = !defaultValues.createdById;
	const isNew = !defaultValues.createdAt;

	const editable =
		isNew ||
		isLocal ||
		session.data?.user.role === 'admin' ||
		session.data?.user.id === defaultValues.createdById;

	const formProps = useForm({
		defaultValues,
		resolver: zodResolver(TalentForm)
	});

	const rows = useWatch({ name: 'rows', control: formProps.control });
	const [selected, setSelected] = useState(-1);

	return (
		<FormProvider {...formProps}>
			<form className="haax-surface-3 flex flex-col gap-3">
				<TopBar editable={editable} isNew={isNew} />

				<hr />

				<div className="-m-3 flex flex-col md:min-h-184 md:flex-row md:justify-center">
					<div className="relative flex grow">
						<ScrollArea
							ref={treeElemRef}
							containerClassName="grow shrink"
							contentClassName="grid grid-cols-[repeat(4,max-content)] content-center justify-center gap-6 py-10 px-3 md:px-10 select-none md:py-18 h-full"
						>
							{[...Array(rows * 4).keys()].map(i => (
								<TalentPreview
									key={i}
									i={i}
									selected={selected}
									setSelected={setSelected}
									editable={editable}
								/>
							))}
						</ScrollArea>
						{editable && <UndoRedo defaultValues={defaultValues} />}
						<div className="absolute top-3 right-3 flex gap-2 overflow-hidden">
							<TextButton
								icon={<Camera />}
								title="Screenshot"
								onClick={async () => {
									if (!treeElemRef.current) return;
									await elementToPng(
										treeElemRef.current,
										formProps.getValues().name
									);
								}}
								className="-m-2"
							/>
							<TextButton
								icon={<NotebookPen />}
								title="Notes"
								onClick={() => setSelected(-1)}
								className="-m-2"
							/>
						</div>
						<div className="absolute bottom-3 left-3 flex flex-col items-start gap-2">
							{isLocal ? (
								<p className="flex items-center gap-1 text-sm text-blue-gray">
									<CloudOff size={14} />
									Local only
								</p>
							) : defaultValues.visibility === 'private' ? (
								<p className="flex items-center gap-1 text-sm text-warm-green">
									<EyeOff size={14} />
									Private
								</p>
							) : (
								<p className="flex items-center gap-1 text-sm">
									<Eye size={14} />
									Public
								</p>
							)}
							{defaultValues.createdBy && (
								<div className="flex items-center gap-1.5 text-blue-gray">
									Author:{' '}
									<TextButton
										icon={<UserAvatar image={defaultValues.createdBy.image} />}
										type="link"
										href={`/profile/${defaultValues.createdById}`}
										className="p-0!"
									>
										<UserRoleText role={defaultValues.createdBy.role}>
											{defaultValues.createdBy.name}
										</UserRoleText>
									</TextButton>
								</div>
							)}
						</div>
						<PointsSummary />
					</div>

					<div className="shrink grow border-t border-gray/40 md:ml-0 md:w-lg md:border-t-0 md:border-l">
						{selected === -1 ? (
							<Notes editable={editable} />
						) : (
							<TalentEdit
								key={selected}
								selected={selected}
								setSelected={setSelected}
								editable={editable}
							/>
						)}
					</div>
				</div>
			</form>
		</FormProvider>
	);
};

export default TalentBuilder;
