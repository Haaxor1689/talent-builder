'use client';

import { LogIn, LogOut } from 'lucide-react';
import { signIn, signOut } from 'next-auth/react';

import TextButton from '../styled/TextButton';

const SignInOut = ({ signedIn }: { signedIn: boolean }) => (
	<TextButton
		icon={signedIn ? LogOut : LogIn}
		onClick={
			signedIn
				? () => signOut()
				: async () => {
						await signIn('discord');
						close();
				  }
		}
	>
		<span className="hidden text-inherit md:inline">
			{signedIn ? 'Sign out' : 'Sign in'}
		</span>
	</TextButton>
);

export default SignInOut;
