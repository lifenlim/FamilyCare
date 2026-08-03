import { MessageSquareHeart } from "lucide-react";
import { FeedbackForm } from "@/components/feedback/FeedbackForm";
import { getDictionary } from "@/lib/i18n/getDictionary";

export default async function FeedbackPage() {
  const dictionary = await getDictionary();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold sm:text-3xl">
          <MessageSquareHeart className="h-6 w-6 text-primary sm:h-8 sm:w-8" aria-hidden="true" />
          {dictionary.feedback.heading}
        </h1>
        <p className="mt-1 text-base text-muted sm:text-lg">{dictionary.feedback.intro}</p>
      </div>

      <FeedbackForm />
    </div>
  );
}
