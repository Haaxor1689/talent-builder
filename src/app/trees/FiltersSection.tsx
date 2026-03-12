'use client';

import { useEffect, useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useSearchParams } from 'next/navigation';

import ClassPicker from '#components/form/ClassPicker.tsx';
import Input from '#components/form/Input.tsx';
import VersionPicker from '#components/form/VersionPicker.tsx';
import useDebounced from '#hooks/useDebounced.ts';
import { TreesFilters } from '#server/schemas.ts';
import { zodResolver } from '#utils/index.ts';

const FiltersSection = () => {
	const searchParams = useSearchParams();

	const defaultValues = useMemo(() => {
		const p = TreesFilters.safeParse(
			Object.fromEntries(searchParams.entries())
		);
		return p.success ? p.data : TreesFilters.parse({});
	}, [searchParams]);

	const formProps = useForm({
		defaultValues,
		resolver: zodResolver(TreesFilters)
	});
	const { register, watch } = formProps;

	// eslint-disable-next-line react-hooks/incompatible-library
	const values = useDebounced(watch(), 500);
	useEffect(() => {
		const params = new URLSearchParams(searchParams.toString());
		if (values.name) params.set('name', values.name);
		else params.delete('name');
		if (values.from) params.set('from', values.from);
		else params.delete('from');
		if (values.class) params.set('class', values.class.toString());
		else params.delete('class');
		if (values.version !== undefined)
			params.set('version', values.version.toString());
		else params.delete('version');

		if (searchParams.toString() === params.toString()) return;
		window.history.replaceState(
			null,
			'',
			[location.origin, location.pathname, `?${params.toString()}`].join('')
		);
	}, [values, searchParams]);

	return (
		<FormProvider {...formProps}>
			<form className="haax-surface-3 flex flex-col items-stretch gap-2 md:flex-row md:items-center md:p-4">
				<Input
					{...register('name')}
					placeholder="Tree name"
					className="grow md:mr-2"
				/>
				<div className="flex items-center justify-between gap-2">
					<Input
						{...register('from')}
						placeholder="Author"
						className="shrink grow"
					/>
					<ClassPicker name="class" />
					<VersionPicker name="version" />
				</div>
			</form>
		</FormProvider>
	);
};

export default FiltersSection;
