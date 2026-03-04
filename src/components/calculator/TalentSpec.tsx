'use client';

import { useFormContext, useWatch } from 'react-hook-form';
import { ExternalLink, NotebookPen, Workflow, X } from 'lucide-react';

import { type BuildFormT, type TalentFormT } from '#server/schemas.ts';
import { isEmptyTalent } from '#utils.ts';

import Dialog from '../styled/Dialog';
import Md from '../styled/Md';
import ScrollArea from '../styled/ScrollArea';
import SpellIcon from '../styled/SpellIcon';
import TextButton from '../styled/TextButton';
import TalentPreview from './TalentPreview';
import TreePickDialog from './TreePickDialog';

type Props = {
	idx: 0 | 1 | 2;
	value?: TalentFormT;
	canChangeTree?: boolean;
};

const PointsSpent = ({ idx, value }: Props) => {
	const points = useWatch<BuildFormT, `points.${0 | 1 | 2}`>({
		name: `points.${idx}`
	});
	return (
		<span className="h3 text-blue-gray">
			{points.reduce((acc, curr) => acc + curr, 0)} /{' '}
			{value?.talents.reduce((acc, curr) => acc + (curr?.ranks ?? 0), 0)}
		</span>
	);
};

const TalentSpec = ({ idx, value, canChangeTree }: Props) => {
	const { setValue } = useFormContext<BuildFormT>();

	if (!value)
		return (
			<div className="border-blue-gray/20 min-h-[50vh] grow first:border-r last:border-l">
				<TreePickDialog
					idx={idx}
					trigger={open => (
						<TextButton
							onClick={open}
							className="h-full w-full items-center justify-center"
						>
							<p className="h1 text-7xl text-inherit">+</p>
							<p className="h3 text-inherit">Pick a tree</p>
						</TextButton>
					)}
				/>
			</div>
		);

	return (
		<div className="border-blue-gray/20 flex grow flex-col first:border-r last:border-l">
			<div className="flex items-center gap-2 p-3">
				<SpellIcon icon={value.icon} className="size-8" />
				<div className="relative h-full grow overflow-hidden">
					<span className="h3 absolute inset-0 truncate" title={value.name}>
						{value.name}
					</span>
				</div>
				<TextButton
					icon={ExternalLink}
					title="Open tree"
					type="link"
					href={`/tree/${value.id}`}
					className="-m-2"
				/>
				<PointsSpent idx={idx} value={value} />
			</div>

			<hr className="mx-0!" />

			<div className="grid grid-cols-[repeat(4,max-content)] content-center justify-center gap-6 p-3 select-none">
				{value.talents.map((field, i) =>
					isEmptyTalent(field) ? (
						<div key={i} />
					) : (
						<TalentPreview
							key={i}
							{...field}
							i={i}
							idx={idx}
							talents={value.talents}
						/>
					)
				)}
			</div>

			<div className="flex justify-center gap-2">
				{canChangeTree && (
					<TreePickDialog
						idx={idx}
						trigger={open => (
							<TextButton
								onClick={open}
								icon={Workflow}
								iconSize={14}
								className="text-blue-gray text-sm"
							>
								Change tree
							</TextButton>
						)}
					/>
				)}
				{value.notes && (
					<Dialog
						trigger={open => (
							<TextButton
								icon={NotebookPen}
								onClick={open}
								iconSize={14}
								className="text-blue-gray text-sm"
							>
								Notes
							</TextButton>
						)}
					>
						<h3 className="haax-color">{value.name} notes</h3>
						<hr />
						<ScrollArea
							containerClassName="-m-3"
							contentClassName="p-3 flex flex-col gap-3"
						>
							<Md text={value.notes} />
						</ScrollArea>
					</Dialog>
				)}
				<TextButton
					onClick={() =>
						setValue(
							`points.${idx}`,
							[...Array(4 * 7).keys()].map(() => 0)
						)
					}
					icon={X}
					iconSize={14}
					className="text-red text-sm"
				>
					Clear points
				</TextButton>
			</div>
		</div>
	);
};

export default TalentSpec;
