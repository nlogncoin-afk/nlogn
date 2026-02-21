import React from 'react';

const FullScreenLoader = () => (
    <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#000000' // Matches min-h-screen bg-black used in Login/App
    }}>
        <div className="w-12 h-12 border-4 border-zinc-500 border-t-white rounded-full animate-spin"></div>
    </div>
);

export default FullScreenLoader;
