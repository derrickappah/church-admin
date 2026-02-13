'use client'

import { useState, useEffect } from 'react'
import { Quote } from 'lucide-react'
import { QUOTES } from '@/lib/constants/quotes'

export default function LoginQuotes() {
    const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0)

    useEffect(() => {
        // Set a random initial quote index on mount to avoid hydration mismatch
        setCurrentQuoteIndex(Math.floor(Math.random() * QUOTES.length))

        const timer = setInterval(() => {
            setCurrentQuoteIndex((prev) => {
                let nextIndex
                do {
                    nextIndex = Math.floor(Math.random() * QUOTES.length)
                } while (nextIndex === prev && QUOTES.length > 1)
                return nextIndex
            })
        }, 5000)

        return () => clearInterval(timer)
    }, [])

    return (
        <div className="hidden w-1/2 bg-black lg:flex flex-col items-center justify-center p-12 relative overflow-hidden">
            {/* Abstract Background Element */}
            <div className="absolute top-0 left-0 w-full h-full opacity-20">
                <div className="absolute top-[-20%] left-[-20%] w-[70%] h-[70%] bg-blue-600 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-20%] right-[-20%] w-[70%] h-[70%] bg-purple-600 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-lg text-center">
                <Quote className="h-12 w-12 text-slate-600 mb-8 mx-auto opacity-50" />

                <div className="h-48 flex flex-col justify-center transition-all duration-500 ease-in-out">
                    <h2 className="text-3xl font-light text-white mb-6 leading-relaxed italic">
                        "{QUOTES[currentQuoteIndex].text}"
                    </h2>
                    <p className="text-slate-400 text-lg font-medium">
                        — {QUOTES[currentQuoteIndex].author}
                    </p>
                </div>
            </div>
        </div>
    )
}
