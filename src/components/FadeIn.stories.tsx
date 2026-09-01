import { FadeIn, StaggerContainer, StaggerItem } from './FadeIn';

export const FadeInBasic = () => (
  <div className="p-stack-md bg-surface min-h-[60dvh] flex items-center justify-center">
    <FadeIn>
      <div className="rounded-xl bg-primary-container text-on-primary-container px-stack-md py-stack-sm font-headline">
        Fades in on scroll
      </div>
    </FadeIn>
  </div>
);

export const FadeInDelayed = () => (
  <div className="p-stack-md bg-surface min-h-[60dvh] flex flex-col items-center justify-center gap-stack-sm">
    <FadeIn>
      <div className="rounded-xl bg-primary-container text-on-primary-container px-stack-md py-stack-sm font-headline">
        First
      </div>
    </FadeIn>
    <FadeIn delay={0.3}>
      <div className="rounded-xl bg-secondary-container text-on-secondary-container px-stack-md py-stack-sm font-headline">
        Second
      </div>
    </FadeIn>
    <FadeIn delay={0.6}>
      <div className="rounded-xl bg-tertiary-container text-on-tertiary-container px-stack-md py-stack-sm font-headline">
        Third
      </div>
    </FadeIn>
  </div>
);

export const Staggered = () => (
  <div className="p-stack-md bg-surface min-h-[60dvh]">
    <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 gap-stack-sm">
      {Array.from({ length: 6 }).map((_, i) => (
        <StaggerItem key={i}>
          <div className="rounded-xl aspect-[4/5] bg-primary-container text-on-primary-container flex items-center justify-center font-headline">
            {i + 1}
          </div>
        </StaggerItem>
      ))}
    </StaggerContainer>
  </div>
);
