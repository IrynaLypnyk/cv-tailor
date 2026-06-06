"use client";
import { capitalizeFirstLetter } from "@/lib/utils/capitilizaFirstLetter";
import { StepId } from "./StepNav";
import { Button } from "../ui/Button";
import { BurgerMenuIcon } from "../icons/BurgerMenuIcon";
import { LogoutIcon } from "../icons/LogoutIcon";
import { AlertBanner } from "../ui/AlertBanner";

interface PageHeaderProps {
  activeStep: StepId;
  isAdmin: boolean;
  handleLogout: () => void;
  openMobileSidebar: () => void;
  isForcedDemoMode: boolean;
}

export function PageHeader({
  activeStep,
  isAdmin,
  handleLogout,
  openMobileSidebar,
  isForcedDemoMode,
}: PageHeaderProps) {
  const title = capitalizeFirstLetter(activeStep);
  const description = "AI-powered CV optimization for your dream job";
  console.log(isForcedDemoMode, isAdmin);
  return (
    <header
      data-component="PageHeader"
      className="flex items-start justify-between gap-4 py-4 md:py-6"
    >
      <div className="flex items-center gap-2">
        <Button
          variant="icon"
          onClick={openMobileSidebar}
          className="block md:hidden"
        >
          <BurgerMenuIcon />
        </Button>
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            {title}
          </h2>
          <p className="hidden md:block text text-muted">{description}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {isAdmin && isForcedDemoMode && (
          <AlertBanner variant="info" title="Admin Mode">
            <a
              href="/"
              className="underline underline-offset-2 hover:opacity-70"
            >
              Exit demo preview
            </a>
          </AlertBanner>
        )}
        {!isAdmin && (
          <AlertBanner
            variant="amber"
            title="Guest Mode"
            description={
              <>
                <span className="font-semibold">Limited Access.</span>
                <br /> <span>2 real AI requests</span>
              </>
            }
          />
        )}
        {isAdmin ? (
          <Button
            variant="icon"
            onClick={handleLogout}
            className="shrink-0 text-brand-secondary"
          >
            <LogoutIcon className="w-5 h-5" />
          </Button>
        ) : undefined}
      </div>
    </header>
  );
}
