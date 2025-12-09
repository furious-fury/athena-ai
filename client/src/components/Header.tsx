import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Header() {
    return (
        <header className="">
            <ConnectButton showBalance={false} />
        </header>
    )
}
