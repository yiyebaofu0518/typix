import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { useAiService } from "@/app/hooks/useService";
import { ProviderIcon } from "@lobehub/icons";
import { useTranslation } from "react-i18next";

interface ModelSelectorProps {
	currentProvider: string;
	currentModel: string;
	onModelChange: (provider: string, model: string) => void;
	// Flag to indicate if this is for a new chat (should auto-select) or existing chat (should not auto-select)
	isNewChat?: boolean;
}

export function ModelSelector({ currentProvider, currentModel, onModelChange, isNewChat = false }: ModelSelectorProps) {
	const { t, i18n } = useTranslation();
	const aiService = useAiService();

	// Fetch AI providers and models
	const { data: providers, isLoading } = aiService.getEnabledAiProvidersWithModels.swr("ai-providers-with-models");

	// No auto-selection logic here - it's handled in the parent component

	// Find current provider and model info for display
	const provider = providers?.find((p) => p.id === currentProvider);
	const model = provider?.models.find((m) => m.id === currentModel);
	const displayName = model?.name || currentModel;

	// Create a combined value for the select (provider:model)
	const currentValue = `${currentProvider}:${currentModel}`;

	const handleValueChange = (value: string) => {
		const [provider, model] = value.split(":");
		if (provider && model) {
			onModelChange(provider, model);
		}
	};

	if (isLoading) {
		return (
			<div className="flex items-center gap-2">
				<div className="h-4 w-4 animate-pulse rounded bg-muted" />
				<div className="h-4 w-20 animate-pulse rounded bg-muted" />
			</div>
		);
	}

	// If no provider or model is selected, show loading state
	if (!currentProvider || !currentModel) {
		return (
			<div className="flex items-center gap-2">
				<div className="h-4 w-4 animate-pulse rounded bg-muted" />
				<div className="h-4 w-20 animate-pulse rounded bg-muted" />
			</div>
		);
	}

	return (
		<Select value={currentValue} onValueChange={handleValueChange}>
			<SelectTrigger className="h-7 w-auto gap-2 border-primary/20 bg-primary/10 px-3 text-primary hover:bg-primary/20">
				<SelectValue placeholder={displayName} />
			</SelectTrigger>
			<SelectContent>
				{providers?.map((provider) => {
					if (!provider.enabled) return null;

					return (
						<div key={provider.id}>
							{/* Provider group header */}
							<div className="flex items-center gap-2 px-2 py-1.5 font-medium text-muted-foreground text-sm">
								<ProviderIcon forceMono provider={provider.id} type="mono" className="h-4 w-4" />
								{provider.name}
							</div>

							{/* Models for this provider */}
							{provider.models.map((model) => (
								<SelectItem key={`${provider.id}:${model.id}`} value={`${provider.id}:${model.id}`} className="pl-8">
									{model.name}
								</SelectItem>
							))}
						</div>
					);
				})}
			</SelectContent>
		</Select>
	);
}
