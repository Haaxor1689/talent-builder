'use client';

import { FormProvider, useForm } from 'react-hook-form';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo } from 'react';

import { zodResolver } from '~/utils';
import { Filters } from '~/server/api/types';
import Input from '~/components/form/Input';
import ClassPicker from '~/components/form/ClassPicker';
import useDebounced from '~/hooks/useDebounced';
import CheckboxInput from '~/components/form/CheckboxInput';

const FiltersSection = () => {
	const searchParams = useSearchParams();

	const defaultValues = useMemo(() => {
		const p = Filters.safeParse(Object.fromEntries(searchParams.entries()));
		return p.success ? p.data : Filters.parse({});
	}, [searchParams]);

	const formProps = useForm({ defaultValues, resolver: zodResolver(Filters) });
	const { register, watch } = formProps;

	const values = useDebounced(watch(), 500);
	useEffect(() => {
		const params = new URLSearchParams(searchParams.toString());
		if (values.name) params.set('name', values.name);
		else params.delete('name');
		if (values.from) params.set('from', values.from);
		else params.delete('from');
		if (values.class) params.set('class', values.class.toString());
		else params.delete('class');
		if (values.onlyPersonal) params.set('onlyPersonal', 'true');
		else params.delete('onlyPersonal');

		if (searchParams.toString() === params.toString()) return;
		window.history.replaceState(
			null,
			'',
			[location.origin, location.pathname, `?${params.toString()}`].join('')
		);
	}, [values, searchParams]);

	return (
		<FormProvider {...formProps}>
			<form className="tw-surface flex flex-col items-stretch gap-2 md:flex-row md:items-center md:p-4">
				<Input
					{...register('name')}
					placeholder="Tree name"
					className="grow md:mr-2"
				/>
				<div className="flex items-center justify-between gap-2">
					<Input
						{...register('from')}
						placeholder="Author"
						disabled={values.onlyPersonal}
						className="grow"
					/>
					<CheckboxInput name="onlyPersonal" label="Mine" />
					<ClassPicker name="class" />
				</div>
			</form>
		</FormProvider>
	);
};

export default FiltersSection;
