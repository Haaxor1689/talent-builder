'use client';

import { useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';

import { useSession } from '#auth/client.ts';
import ClassCalculatorsLinks from '#components/calculator/ClassCalculatorsLinks.tsx';
import IconPicker from '#components/form/IconPicker.tsx';
import Input from '#components/form/Input.tsx';
import TextButton from '#components/styled/TextButton.tsx';
import TreeGridItem from '#components/styled/TreeGridItem.tsx';
import { UserAvatar, UserRoleText } from '#components/styled/User.tsx';
import { type getCollectionTrees } from '#server/api/collection.ts';
import { type ServerFunctionReturn } from '#server/helpers.ts';
import { CollectionForm } from '#server/schemas.ts';
import { canEdit } from '#utils/auth.ts';
import {
	classMask,
	maskToClass,
	nullableInput,
	zodResolver
} from '#utils/index.ts';

import DeleteDialog from './DeleteDialog';
import SaveDialog from './SaveDialog';

type Props = {
	defaultValues: CollectionForm;
	trees: ServerFunctionReturn<typeof getCollectionTrees>;
};

const CollectionPage = ({ defaultValues, trees }: Props) => {
	const session = useSession().data;
	const editable = session ? canEdit(session.user, defaultValues) : false;
	const [dragging, setDragging] = useState(false);

	const form = useForm({
		defaultValues,
		resolver: zodResolver(CollectionForm)
	});

	const assignedTrees = useWatch({
		name: 'assignedTrees',
		control: form.control
	});

	const classOrder = Object.keys(classMask).map(Number);
	const assigned = new Map(
		Object.entries(assignedTrees).map(([key, treeId]) => [
			key,
			trees.find(r => r.id === treeId)
		])
	);
	const unassigned = trees.filter(
		r => !Object.values(assignedTrees).includes(r.id)
	);

	return (
		<FormProvider {...form}>
			<div className="haax-surface-3 flex-row flex-wrap items-center justify-center gap-2">
				<IconPicker name="icon" disabled={!editable} />
				<Input
					placeholder="No tree name..."
					{...form.register('name', nullableInput)}
					disabled={!editable}
					className="min-w-64 shrink grow [&_input]:text-3xl"
				/>
				{defaultValues.createdBy && (
					<div className="flex grow items-center gap-1.5">
						<span className="mr-2">by</span>
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
				{editable && (
					<>
						<SaveDialog />
						<DeleteDialog />
					</>
				)}
			</div>

			<h2 className="-mb-3 haax-color text-center md:text-left">
				Talent calculators:
			</h2>
			<ClassCalculatorsLinks
				urlBase={`/collections/${defaultValues.slug ?? defaultValues.id}/`}
			/>

			<h2 className="-mb-3 haax-color text-center md:text-left">
				Class trees:
			</h2>
			<div className="haax-surface-3 grid gap-3 md:grid-cols-3">
				{classOrder.flatMap(classId => {
					const classTrees = [0, 1, 2].map(tab =>
						assigned.get(`${classId}:${tab}`)
					);
					const classInfo = maskToClass(classId);
					return classTrees.map((tree, tab) => (
						<div
							key={`${classId}:${tab}`}
							onDragOver={e => {
								if (!editable) return;
								e.preventDefault();
							}}
							onDrop={e => {
								if (!editable || !dragging) return;
								e.preventDefault();
								const treeId = e.dataTransfer.getData('text');

								const newAssignedTrees = { ...assignedTrees };
								const key = Object.entries(assignedTrees).find(
									([_, id]) => id === treeId
								)?.[0];
								if (key) delete newAssignedTrees[key];

								form.setValue('assignedTrees', {
									...newAssignedTrees,
									[`${classId}:${tab}`]: treeId
								});
								setDragging(false);
							}}
							className="relative inline min-h-20 items-center"
						>
							{!tree ? (
								<div className="flex h-full items-center justify-center text-center text-sm text-blue-gray">
									No {classInfo?.name ?? classId} tab {tab + 1} tree
								</div>
							) : (
								<TreeGridItem
									item={tree}
									href={`/tree/${tree.slug ?? tree.id}`}
									label={`Open ${classInfo?.name ?? classId} tab ${tab + 1}`}
									hideTooltip={!!dragging}
									onDragStart={e => {
										e.stopPropagation();
										if (!editable || !tree) {
											e.preventDefault();
											return;
										}

										setDragging(true);
										e.dataTransfer.setData('text', tree.id);
										e.dataTransfer.setDragImage(e.currentTarget, 0, 0);
										window.addEventListener(
											'dragend',
											() => setDragging(false),
											{ once: true }
										);
									}}
								/>
							)}
							{dragging && (
								<div className="pointer-events-none absolute inset-0 border-2 border-dashed border-blue-gray/50" />
							)}
						</div>
					));
				})}
			</div>

			<h2 className="-mb-3 haax-color text-center md:text-left">
				Other trees in this collection:
			</h2>
			<div
				onDragOver={e => {
					if (!editable) return;
					e.preventDefault();
				}}
				onDrop={e => {
					if (!editable || !dragging) return;
					e.preventDefault();
					setDragging(false);
					const treeId = e.dataTransfer.getData('text');
					const key = Object.entries(assignedTrees).find(
						([_, id]) => id === treeId
					)?.[0];
					if (!key) return;
					const newAssignedTrees = { ...assignedTrees };
					delete newAssignedTrees[key];
					form.setValue('assignedTrees', newAssignedTrees);
				}}
				className="haax-surface-3 grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] items-start"
			>
				{unassigned.length ? (
					unassigned.map(tree =>
						tree ? (
							<TreeGridItem
								key={tree.id}
								item={tree}
								href={`/tree/${tree.id}`}
								hideTooltip={!!dragging}
								onDragStart={e => {
									e.stopPropagation();
									if (!editable || !tree) {
										e.preventDefault();
										return;
									}

									setDragging(true);
									e.dataTransfer.setData('text', tree.id);
									e.dataTransfer.setDragImage(e.currentTarget, 0, 0);
									window.addEventListener('dragend', () => setDragging(false), {
										once: true
									});
								}}
							/>
						) : null
					)
				) : (
					<p className="col-span-3 my-6 text-center text-blue-gray">
						No unassigned trees in this collection
					</p>
				)}
				{dragging && (
					<div className="pointer-events-none absolute inset-0 border-2 border-dashed border-blue-gray/50" />
				)}
			</div>
		</FormProvider>
	);
};

export default CollectionPage;
