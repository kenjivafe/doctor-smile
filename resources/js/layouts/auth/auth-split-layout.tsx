import AppLogoIcon from '@/components/app-logo-icon';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    title?: string;
    description?: string;
}

export default function AuthSplitLayout({ children, title, description }: PropsWithChildren<AuthLayoutProps>) {
    const { name, quote } = usePage<SharedData>().props;

    return (
        <div className="grid relative flex-col justify-center items-center px-8 h-dvh sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0">
            <div className="hidden relative flex-col p-10 h-full text-white bg-muted lg:flex dark:border-r">
                <div className="absolute inset-0 bg-zinc-900" />
                <Link href={route('home')} className="flex relative z-20 items-center text-lg font-medium">
                    <AppLogoIcon className="mr-2 text-white fill-current size-8" />
                    {name}
                </Link>
                {quote && (
                    <div className="relative z-20 mt-auto">
                        <blockquote className="space-y-2">
                            <p className="text-lg">&ldquo;{quote.message}&rdquo;</p>
                            <footer className="text-sm text-neutral-300">{quote.author}</footer>
                        </blockquote>
                    </div>
                )}
            </div>
            <div className="w-full lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <Link href={route('home')} className="flex relative z-20 justify-center items-center lg:hidden">
                        <AppLogoIcon className="h-10 text-black fill-current sm:h-12" />
                    </Link>
                    <div className="flex flex-col gap-2 items-start text-left sm:items-center sm:text-center">
                        <h1 className="text-xl font-medium">{title}</h1>
                        <p className="text-sm text-muted-foreground text-balance">{description}</p>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
