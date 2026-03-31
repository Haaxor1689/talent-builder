'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import Input from '#components/form/Input.tsx';
import useDebounced from '#hooks/useDebounced.ts';
import { CollectionsFilters } from '#server/schemas.ts';
import { zodResolver } from '#utils/index.ts';

const CollectionsFiltersSection = () => {
	const searchParams = useSearchParams();

	const defaultValues = useMemo(() => {
		const p = CollectionsFilters.safeParse(
			Object.fromEntries(searchParams.entries())
		);
		return p.success ? p.data : CollectionsFilters.parse({});
	}, [searchParams]);

	const formProps = useForm({
		defaultValues,
		resolver: zodResolver(CollectionsFilters)
	});
	const { register, watch } = formProps;

	const values = useDebounced(watch(), 500);
	useEffect(() => {
		const params = new URLSearchParams(searchParams.toString());
		if (values.name) params.set('name', values.name);
		else params.delete('name');
		if (values.from) params.set('from', values.from);
		else params.delete('from');

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
					placeholder="Collection name"
					className="grow"
				/>
				<Input {...register('from')} placeholder="Author" className="grow" />
			</form>
		</FormProvider>
	);
};

export default CollectionsFiltersSection;
