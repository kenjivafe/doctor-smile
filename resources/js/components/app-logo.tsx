import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex mb-0.5 justify-center items-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground aspect-square size-8">
                <AppLogoIcon className="size-10" />
            </div>
            <div className="grid flex-1 text-sm text-left">
                <span className="mb-0 text-lg font-bold leading-none truncate">
                    <span className="text-primary">{"Doctor "}</span>
                    <span className="text-secondary">Smile</span>
                </span>
            </div>
        </>
    );
}
