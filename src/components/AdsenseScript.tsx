import Script from 'next/script';

const AdsenseScript = () => (
	<Script
		id="adsense-global"
		async
		strategy="afterInteractive"
		src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8795217129609015"
		crossOrigin="anonymous"
	/>
);

export default AdsenseScript;
