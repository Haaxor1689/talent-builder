import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

import TextButton from './TextButton';

const Md = ({ text }: { text: string }) => (
	<Markdown
		rehypePlugins={[rehypeRaw]}
		remarkPlugins={[remarkGfm]}
		components={{
			p: props =>
				// Do not wrap non-text elements
				typeof props.children === 'string' || Array.isArray(props.children) ? (
					<p className="text-blue-gray">{props.children}</p>
				) : (
					props.children
				),
			h1: props => <p className="haax-color h1 text-2xl">{props.children}</p>,
			h2: props => <p className="h2 text-xl">{props.children}</p>,
			h3: props => <p className="h3 text-lg">{props.children}</p>,
			ul: props => <ul className="list-disc pl-6">{props.children}</ul>,
			ol: props => <ol className="list-decimal pl-6">{props.children}</ol>,
			li: props => <li className="text-blue-gray">{props.children}</li>,
			strong: props => <strong className="font-bold">{props.children}</strong>,
			em: props => <em className="text-blue-gray italic">{props.children}</em>,
			blockquote: props => (
				<blockquote className="haax-surface-2 border-l-4 pl-4 italic">
					{props.children}
				</blockquote>
			),
			a: props => (
				<TextButton
					type="link"
					href={props.href ?? ''}
					external={props.href?.startsWith('http')}
					className="-m-2 inline-flex"
				>
					{props.children}
				</TextButton>
			),
			code: props => {
				if (
					typeof props.children === 'string' &&
					!props.children.includes('\n')
				)
					return (
						<code className="-my-1 border border-blue-gray/20 p-1 font-mono">
							{props.children}
						</code>
					);
				return (
					<code className="haax-surface-2 overflow-auto rounded p-3 font-mono text-sm">
						{props.children}
					</code>
				);
			}
		}}
	>
		{text}
	</Markdown>
);

export default Md;
