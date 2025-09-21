// Server error component to display error messages with a retry option and a sad face icon
import React from 'react';
import { AlertTriangle, Frown, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import { toast } from '@/hooks/use-toast';

interface ServerErrorProps {
	title?: string;
	description?: string;
	retrying?: boolean;
	onRetry?: () => void | null;
}

const ServerError: React.FC<ServerErrorProps> = ({ title, description, retrying, onRetry }) => {
	return (
		<div className="flex flex-col items-center justify-center px-4 pt-4">
			<Frown className="h-12 w-12 text-red-500/70" />
			<h2 className="mt-2 text-lg font-semibold text-gray-800">{title || "Server Error"}</h2>
			<p className="mt-1 text-sm text-gray-600">{description || "Something went wrong. Please try again later."}</p>
			<Button onClick={onRetry} className="mt-4 bg-black hover:bg-black/70 text-gray-700 flex items-center gap-2 rounded-full">
				{retrying ? (
					<Loader2 className="h-4 w-4 text-white animate-spin" />
				) : (
					<>
						<RefreshCw className="h-4 w-4 text-white" />
						<p className='text-white'>Refresh</p>
					</>
				)}

			</Button>
		</div>
	);
};

export default ServerError;