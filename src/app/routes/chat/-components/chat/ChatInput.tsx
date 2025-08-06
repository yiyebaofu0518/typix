import { Button } from "@/app/components/ui/button";
import { ImagePreview, type ImageSlide } from "@/app/components/ui/image-preview";
import { Textarea } from "@/app/components/ui/textarea";
import { cn } from "@/app/lib/utils";
import { Image, Send, X, ZoomIn } from "lucide-react";
import { type KeyboardEvent, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

interface ChatInputProps {
	onSendMessage: (content: string, imageFiles?: File[]) => void;
	disabled?: boolean;
}

export function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
	const { t } = useTranslation();
	const [message, setMessage] = useState("");
	const [selectedImages, setSelectedImages] = useState<File[]>([]);
	const [previewUrls, setPreviewUrls] = useState<string[]>([]);
	const [lightboxOpen, setLightboxOpen] = useState(false);
	const [lightboxIndex, setLightboxIndex] = useState(0);
	const [shouldFocusAfterEnable, setShouldFocusAfterEnable] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	// Monitor disabled state changes and restore focus when re-enabled
	useEffect(() => {
		if (!disabled && shouldFocusAfterEnable && textareaRef.current) {
			textareaRef.current.focus();
			setShouldFocusAfterEnable(false);
		}
	}, [disabled, shouldFocusAfterEnable]);
	const handleSend = () => {
		if ((!message.trim() && selectedImages.length === 0) || disabled) return;

		// Mark that we should focus after the input is re-enabled
		setShouldFocusAfterEnable(true);

		onSendMessage(message.trim(), selectedImages.length > 0 ? selectedImages : undefined);
		setMessage("");
		setSelectedImages([]);
		setPreviewUrls([]);

		// Reset textarea height
		if (textareaRef.current) {
			textareaRef.current.style.height = "auto";
		}
	};

	const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files || []);
		const imageFiles = files.filter((file) => file.type.startsWith("image/"));

		if (imageFiles.length > 0) {
			setSelectedImages((prev) => {
				const newImages = [...prev, ...imageFiles];
				// Generate preview URLs for new images
				const newUrls = [...previewUrls];
				imageFiles.forEach((file, index) => {
					newUrls[prev.length + index] = URL.createObjectURL(file);
				});
				setPreviewUrls(newUrls);
				return newImages;
			});
		}

		// Reset input
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const handleRemoveImage = (index: number) => {
		// Clean up preview URL
		if (previewUrls[index]) {
			URL.revokeObjectURL(previewUrls[index]);
		}

		setSelectedImages((prev) => prev.filter((_, i) => i !== index));
		setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
	};

	const handlePreviewImage = (index: number) => {
		setLightboxIndex(index);
		setLightboxOpen(true);
	};

	// Generate lightbox slides
	const lightboxSlides: ImageSlide[] = selectedImages
		.map((image, index) => ({
			src: previewUrls[index] || "",
			title: image.name,
		}))
		.filter((slide) => slide.src); // Filter out slides without valid src
	return (
		<div className="border-border/50 border-t bg-background/80 p-6 backdrop-blur-md">
			<div className="mx-auto w-full max-w-4xl px-4">
				{/* Input Area */}
				<div className="relative">
					{/* Hidden file input */}
					<input
						ref={fileInputRef}
						type="file"
						accept="image/*"
						onChange={handleImageSelect}
						className="hidden"
						multiple
					/>

					{/* Image preview thumbnails - above the input */}
					{selectedImages.length > 0 && (
						<div className="mb-3 flex flex-wrap gap-2">
							{selectedImages.map((image, index) => (
								<div key={`${image.name}-${index}`} className="group relative">
									<button
										className="relative h-16 w-16 cursor-pointer overflow-hidden rounded-lg border border-border/50 bg-card/80 shadow-sm backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:shadow-md"
										onClick={() => handlePreviewImage(index)}
										onKeyDown={(e) => {
											if (e.key === "Enter" || e.key === " ") {
												e.preventDefault();
												handlePreviewImage(index);
											}
										}}
										type="button"
										title={image.name}
									>
										<img src={previewUrls[index]} alt={`Preview ${index + 1}`} className="h-full w-full object-cover" />
										{/* Hover overlay */}
										<div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
											<ZoomIn className="h-4 w-4 text-white" />
										</div>
									</button>
									{/* Remove button */}
									<Button
										variant="destructive"
										size="icon"
										onClick={(e) => {
											e.stopPropagation();
											handleRemoveImage(index);
										}}
										className="-right-1 -top-1 absolute h-5 w-5 rounded-full opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100"
									>
										<X className="h-3 w-3" />
									</Button>
								</div>
							))}
						</div>
					)}

					{/* Text input container */}
					<div className="relative rounded-xl border border-border/50 bg-card/80 shadow-sm backdrop-blur-sm transition-all duration-200 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20">
						<Textarea
							ref={textareaRef}
							value={message}
							onChange={(e) => setMessage(e.target.value)}
							onKeyDown={handleKeyDown}
							placeholder={t("chat.typeMessage")}
							disabled={disabled}
							className={cn(
								"max-h-60 min-h-[120px] resize-none border-0 bg-transparent pr-4 pb-16 placeholder:text-muted-foreground/60 focus-visible:ring-0",
							)}
							rows={4}
							onInput={(e) => {
								const target = e.target as HTMLTextAreaElement;
								target.style.height = "auto";
								target.style.height = `${Math.min(target.scrollHeight, 240)}px`;
							}}
						/>

						{/* Bottom buttons area */}
						<div className="absolute right-3 bottom-3 flex items-center gap-2">
							{/* Image upload button */}
							<Button
								variant="outline"
								size="icon"
								onClick={() => fileInputRef.current?.click()}
								disabled={disabled}
								className="h-10 w-10 rounded-lg border-border/50 bg-background/80 backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:bg-accent/80"
							>
								<Image className="h-4 w-4" />
							</Button>

							{/* Send button */}
							<Button
								onClick={handleSend}
								disabled={(!message.trim() && selectedImages.length === 0) || disabled}
								size="icon"
								className="h-10 w-10 rounded-lg bg-gradient-to-r from-primary to-primary/90 transition-all duration-200 hover:scale-105 disabled:scale-100 disabled:opacity-50"
							>
								<Send className="h-4 w-4" />
							</Button>
						</div>
					</div>
				</div>

				{/* Image preview lightbox */}
				<ImagePreview
					open={lightboxOpen}
					close={() => setLightboxOpen(false)}
					slides={lightboxSlides}
					index={lightboxIndex}
					onIndexChange={setLightboxIndex}
				/>
			</div>
		</div>
	);
}
