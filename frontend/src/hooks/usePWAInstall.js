import { useEffect, useState } from 'react';

export const usePWAInstall = () => {
    const [promptEvent, setPromptEvent] = useState(null);
    const [installed, setInstalled] = useState(() => window.matchMedia('(display-mode: standalone)').matches);

    useEffect(() => {
        const handlePrompt = (event) => {
            event.preventDefault();
            setPromptEvent(event);
        };
        const handleInstalled = () => {
            setInstalled(true);
            setPromptEvent(null);
        };
        window.addEventListener('beforeinstallprompt', handlePrompt);
        window.addEventListener('appinstalled', handleInstalled);
        return () => {
            window.removeEventListener('beforeinstallprompt', handlePrompt);
            window.removeEventListener('appinstalled', handleInstalled);
        };
    }, []);

    const install = async () => {
        if (!promptEvent) return;
        await promptEvent.prompt();
        await promptEvent.userChoice;
        setPromptEvent(null);
    };

    return { canInstall: Boolean(promptEvent) && !installed, install };
};
