import { SubscriptionButton } from "@/components/subscription-button";
import { checkSubscription } from "@/lib/subscription";

const SettingsPage = async () => {
  const isPro = await checkSubscription();

  return (
    <div className="h-full p-4 space-y-2">
      <h3 className="text-lg font-medium">Paramètres</h3>
      <div className="text-muted-foreground text-sm">
        {isPro
          ? "Vous possédez un compte premium"
          : "Vous ne possédez pas de compte premium"}
      </div>
      <SubscriptionButton isPro={isPro} />
    </div>
  );
};

export default SettingsPage;
