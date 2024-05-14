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
		const params = new URLSearchParams();
		params.set('f', '');

		if (values.name) params.set('name', values.name);
		if (values.from) params.set('from', values.from);
		if (values.class) params.set('class', values.class.toString());

		if (searchParams.toString() === params.toString()) return;
		router.push(`${window.location.origin}${pathname}?${params.toString()}`);
	}, [values, pathname, router, searchParams]);

	return (
		<FormProvider {...formProps}>
			<div className="flex flex-col items-stretch gap-2 md:flex-row">
				<div className="px-2 md:px-0">
					<ListFilter size={38} className="text-orange" />
				</div>
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
