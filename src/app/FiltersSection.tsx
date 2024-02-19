'use client';

import { ListFilter } from 'lucide-react';
import { FormProvider, useForm } from 'react-hook-form';
import { usePathname, useRouter } from 'next/navigation';

import { zodResolver } from '~/utils';
import { Filters, type FiltersT } from '~/server/api/types';

import Input from './_components/form/Input';
import TextButton from './_components/styled/TextButton';
import ClassPicker from './_components/form/ClassPicker';

const FiltersSection = (defaultValues: FiltersT) => {
	const router = useRouter();
	const pathname = usePathname();

	const formProps = useForm({
		defaultValues,
		resolver: zodResolver(Filters)
	});
	const { register, handleSubmit } = formProps;

	return (
		<FormProvider {...formProps}>
			<div className="flex flex-col items-stretch gap-2 md:flex-row">
				<ListFilter size={38} className="text-orange" />
				<form
					onSubmit={handleSubmit(v => {
						const params = new URLSearchParams();

						if (v.name) params.set('name', v.name);
						if (v.from) params.set('from', v.from);
						if (v.class) params.set('class', v.class.toString());
						router.push(`${pathname}?${params.toString()}`);
					})}
					className="tw-surface flex grow flex-col items-stretch gap-2 md:flex-row md:items-center md:p-4"
				>
					<label htmlFor="name">Name:</label>
					<Input {...register('name')} className="grow md:mr-2" />
					<label htmlFor="from">From:</label>
					<Input {...register('from')} />
					<label htmlFor="from">Class:</label>
					<ClassPicker name="class" />

					<TextButton type="submit" icon={ListFilter}>
						Filter
					</TextButton>
				</form>
			</div>
		</FormProvider>
	);
};

export default FiltersSection;
