'use client';

import { type TalentFormT } from '~/server/api/types';

import useLocalStorage from '../_components/hooks/useLocalStorage';
import Spinner from '../_components/styled/Spinner';
import TalentBuilder from '../_components/builder/TalentBuilder';

const NewTreePage = () => {
	const [savedState, _0, stateLoading] =
		useLocalStorage<TalentFormT>('saved-form-state');

	if (stateLoading)
		return (
			<div className="flex grow items-center justify-center">
				<Spinner />
			</div>
		);

	return <TalentBuilder defaultValues={savedState} isLocal isNew />;
};

export default NewTreePage;
