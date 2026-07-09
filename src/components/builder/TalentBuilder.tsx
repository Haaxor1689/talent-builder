'use client';

import dedent from 'dedent';
import {
	BookOpenText,
	Camera,
	CloudOff,
	Eye,
	EyeOff,
	NotebookPen
} from 'lucide-react';
import { useRef, useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';

import { useSession } from '#auth/client.ts';
import CollapsibleSection from '#components/styled/CollapsibleSection.tsx';
import Md from '#components/styled/Md.tsx';
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

const builderInstructionsText = dedent`
# Builder Basics

The builder is for creating and editing full talent trees. Use it when you want to define talent layout, requirements, descriptions, and tree notes.

1. **Fill out basic info:** This is purely for display and searching purposes and does not affect any functionality.
1. **Pick a game version:** select how many rows your tree will have. You can either click through existing game versions or enter a custom number of rows. This will also determine which calculators your tree is compatible with.
1. **Write notes:** you can use the \`Edit Notes\` button in the right panel to add context, explanations, or any other information relevant to your tree. This input supports Markdown formatting, so you can use headings, lists, links, and other [Markdown features](https://www.markdownguide.org/basic-syntax/) to structure your notes effectively.

# Tree Editing

Pick a talent slot in the left panel to select it. You can then edit its properties like icon, name, rank and description in the right panel.

You can also drag and drop talents to rearrange them within the tree. Use the undo/redo buttons in the top right corner to revert or reapply changes.

Numerical values that differ based on the rank can be entered as \`/\` seperated values. Postfixes such as \`%\` should not be repeated. When written correctly, you will see these values formatted in \`[10/20/30]%\` style in the tooltip when hovering over the talent. When viewed in calculator, the current allocated rank value will be highlighted.

To set requirements for a talent, shift + click on the talent you want to require. If you see a red icon, it meant the requirement is invalid. To remove a requirement, either shift + click on the current talent or click the remove link button in the right panel.

You can also use the \`Highlight\` checkbox in the right panel to mark a talent as important. This will add a visual highlight to the talent, making it stand out in the tree. This functionality is purely cosmetic and does not affect any calculations or requirements.

The Spell Ids field is for exporting your tree to DBC format using collections. The talent will not be exported if this field is empty and should contain comma separated spell ids for each rank of the talent.

# Collections

Collections are a way to group multiple trees together. You can either add your tree to a collection you have access to or remove it from a collection. Collections can be used to organize trees by theme, class, or any other criteria you choose and they allow you to import/export trees from game files. You can also create new collections and manage existing ones through the collections page.

# Saving and Sharing

Use top bar actions to save updates, clone trees, or remove trees you own. You can change the visibility of your tree while saving. Public trees are visible in listings and can be shared by URL. Private trees are hidden from public listings but can still be accessed by URL.

Local trees are only stored in your browser, do not require you to be signed in, and will not be saved to the server. This means that they also can't be shared with others and will not be accessible from other devices.
`;

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
			<CollapsibleSection
				title={
					<>
						<BookOpenText /> Instructions
					</>
				}
				storageKey="talent-builder"
			>
				<Md text={builderInstructionsText} />
			</CollapsibleSection>
		</FormProvider>
	);
};

export default TalentBuilder;
