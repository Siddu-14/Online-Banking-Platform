function LoadingSpinner({ size = 'md', text = '' }) {
    const sizes = {
        sm: 'w-5 h-5',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
    };

    return (
        <div className="flex flex-col items-center justify-center gap-3">
            <div
                className={`${sizes[size]} border-3 border-dark-200 dark:border-dark-700 border-t-primary-500 rounded-full animate-spin`}
                style={{ borderWidth: '3px' }}
            />
            {text && (
                <p className="text-sm text-dark-500 dark:text-dark-400 font-medium">{text}</p>
            )}
        </div>
    );
}

export default LoadingSpinner;
