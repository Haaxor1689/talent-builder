'use client';

import { type TalentFormT } from '~/server/api/types';

import useLocalStorage from '../_components/hooks/useLocalStorage';
import Spinner from '../_components/styled/Spinner';

import TalentBuilder from './TalentBuilder';
import NotFound from './NotFound';

const ClientLoader = ({ localId }: { localId?: string }) => {
	const [savedState, _0, stateLoading] =
		useLocalStorage<TalentFormT>('saved-form-state');

	const [savedSpecs, _1, specsLoading] =
		useLocalStorage<Record<string, TalentFormT>>('saved-specs');

	if (stateLoading || specsLoading)
		return (
			<div className="flex grow items-center justify-center">
				<Spinner />
			</div>
		);

	if (localId) {
		const localSpec = savedSpecs?.[localId];
		if (!localSpec) return <NotFound />;
		return <TalentBuilder defaultValues={localSpec} isLocal />;
	}

	return <TalentBuilder defaultValues={savedState} isLocal isNew />;
};

export default ClientLoader;
