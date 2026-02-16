'use client';

import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const AboutOverlay = ({ isOpen, onClose }) => {
    const [content, setContent] = useState('Loading...');

    useEffect(() => {
        if (isOpen) {
            fetch('/about.html')
                .then(res => res.text())
                .then(data => setContent(data))
                .catch(err => setContent('Failed to load content.'));
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative w-full max-w-2xl max-h-[80vh] overflow-y-auto glass p-8 rounded-3xl border border-matrix-green/30 shadow-[0_0_50px_rgba(0,255,65,0.2)] animate-in zoom-in-95 duration-300 custom-scrollbar">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-matrix-green/50 hover:text-matrix-green transition-colors"
                >
                    <XMarkIcon className="w-6 h-6" />
                </button>

                <div
                    className="prose prose-invert max-w-none text-white/90 font-suse"
                    dangerouslySetInnerHTML={{ __html: content }}
                />
            </div>
        </div>
    );
};

export default AboutOverlay;
