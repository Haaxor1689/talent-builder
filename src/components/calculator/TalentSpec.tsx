'use client';

import { useFormContext, useWatch } from 'react-hook-form';
import { ExternalLink, NotebookPen, Workflow, X } from 'lucide-react';

import { type BuildForm, type TalentForm } from '#server/schemas.ts';
import { getTalentSum } from '#utils/index.ts';

import Dialog from '../styled/Dialog';
import Md from '../styled/Md';
import ScrollArea from '../styled/ScrollArea';
import SpellIcon from '../styled/SpellIcon';
import TextButton from '../styled/TextButton';
import TalentPreview from './TalentPreview';
import TreePickDialog from './TreePickDialog';

type Props = {
	idx: 0 | 1 | 2;
	tree?: TalentForm;
	rows: number;
	canChangeTree?: boolean;
};

const PointsSpent = ({ idx, total }: { idx: 0 | 1 | 2; total: number }) => {
	const points = useWatch<BuildForm, `points.${0 | 1 | 2}`>({
		name: `points.${idx}`
	});
	return (
		<span className="h3 text-blue-gray">
			{points.reduce((acc, curr) => acc + curr, 0)} / {total}
		</span>
	);
};

const ClearPoints = ({ idx }: { idx: 0 | 1 | 2 }) => {
	const { setValue } = useFormContext<BuildForm>();
	return (
		<TextButton
			icon={<X />}
			onClick={() => setValue(`points.${idx}`, [])}
			className="text-red icon-size-4 text-sm"
		>
			Clear points
		</TextButton>
	);
};

const TalentSpec = ({ idx, tree, rows, canChangeTree }: Props) =>
	!tree ? (
		<div className="border-blue-gray/20 min-h-[50vh] grow first:border-r last:border-l">
			<TreePickDialog
				idx={idx}
				trigger={open => (
					<TextButton
						onClick={open}
						className="h-full w-full flex-col items-center justify-center p-12"
					>
						<p className="h1 text-7xl text-inherit">+</p>
						<p className="h3 whitespace-nowrap text-inherit">Pick a tree</p>
					</TextButton>
				)}
			/>
		</div>
	) : (
		<div className="border-blue-gray/20 flex grow flex-col first:border-r last:border-l">
			<div className="flex items-center gap-2 p-3">
				<SpellIcon icon={tree.icon} className="size-8" />
				<div className="relative h-full grow overflow-hidden">
					<span className="h3 absolute inset-0 truncate" title={tree.name}>
						{tree.name}
					</span>
				</div>
				<TextButton
					icon={<ExternalLink />}
					title="Open tree"
					type="link"
					href={`/tree/${tree.id}`}
					className="-m-2"
				/>
				<PointsSpent idx={idx} total={getTalentSum(tree.talents, tree.rows)} />
			</div>

			<hr className="mx-0!" />

			<div className="grid grid-cols-[repeat(4,max-content)] content-center justify-center gap-6 p-3 select-none">
				{[...Array(tree.rows * 4).keys()].map(i => {
					const field = tree.talents[i];
					return !field ? (
						<div key={i} />
					) : (
						<TalentPreview
							key={i}
							i={i}
							idx={idx}
							talents={tree.talents}
							rows={rows}
						/>
					);
				})}
			</div>

			<div className="flex justify-center gap-2">
				{canChangeTree && (
					<TreePickDialog
						idx={idx}
						trigger={open => (
							<TextButton
								icon={<Workflow />}
								onClick={open}
								className="text-blue-gray icon-size-4 text-sm"
							>
								Change tree
							</TextButton>
						)}
					/>
				)}
				{tree.notes && (
					<Dialog
						trigger={open => (
							<TextButton
								icon={<NotebookPen />}
								onClick={open}
								className="text-blue-gray icon-size-4 text-sm"
							>
								Notes
							</TextButton>
						)}
					>
						<h3 className="haax-color">{tree.name} notes</h3>
						<hr />
						<ScrollArea
							containerClassName="-m-3"
							contentClassName="p-3 flex flex-col gap-3"
						>
							<Md text={tree.notes} />
						</ScrollArea>
					</Dialog>
				)}
				<ClearPoints idx={idx} />
			</div>
		</div>
	);

export default TalentSpec;
