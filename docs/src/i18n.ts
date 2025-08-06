import { getRequestConfig } from "next-intl/server";

export const locales = ["en", "zh"] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ locale }) => {
	if (!locale || !locales.includes(locale as any)) {
		locale = "en";
	}

	return {
		locale,
		messages: (await import(`../messages/${locale}.json`)).default,
	};
});
