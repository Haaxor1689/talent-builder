'use client';

import { ListFilter } from 'lucide-react';
import { FormProvider, useForm } from 'react-hook-form';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

import { zodResolver } from '~/utils';
import { Filters, type FiltersT } from '~/server/api/types';
import Input from '~/components/form/Input';
import ClassPicker from '~/components/form/ClassPicker';
import useDebounced from '~/hooks/useDebounced';

const FiltersSection = (defaultValues: FiltersT) => {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const formProps = useForm({
		defaultValues,
		resolver: zodResolver(Filters)
	});
	const { register, watch } = formProps;

	const values = useDebounced(watch());
	useEffect(() => {
		const params = new URLSearchParams(searchParams.toString());
		if (values.name) params.set('name', values.name);
		else params.delete('name');
		if (values.from) params.set('from', values.from);
		else params.delete('from');
		if (values.class) params.set('class', values.class.toString());
		else params.delete('class');

		if (searchParams.toString() === params.toString()) return;
		router.push(`${window.location.origin}${pathname}?${params.toString()}`);
	}, [values, pathname, router, searchParams]);

	return (
		<FormProvider {...formProps}>
			<div className="flex flex-row items-stretch gap-2">
				<ListFilter size={38} className="w-[41px] shrink-0 text-orange" />
				<form className="tw-surface flex grow flex-col items-stretch gap-2 md:flex-row md:items-center md:p-4">
					<Input
						{...register('name')}
						placeholder="Name"
						className="grow md:mr-2"
					/>
					<div className="flex items-center justify-between gap-2">
						<Input {...register('from')} placeholder="From" className="grow" />
						<ClassPicker name="class" />
					</div>
				</form>
			</div>
		</FormProvider>
	);
};

export default FiltersSection;
