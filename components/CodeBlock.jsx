/** @jsxRuntime classic */
// https://mdxjs.com/guides/live-code/
import { mdx } from "@mdx-js/react"
import dynamic from "next/dynamic"
import Highlight, { defaultProps } from 'prism-react-renderer'
import React, { forwardRef, useEffect, useReducer, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { LiveEditor, LiveError, LivePreview, LiveProvider } from 'react-live' // https://github.com/FormidableLabs/react-live

const IFrame = ({ children, ...props }) => {
    const [ref, setRef] = useState(null)
    const [height, setHeight] = useState('100%')

    const mountNode = ref?.contentWindow?.document?.body

    useEffect(() => {
        window.onmessage = function (e) {
            if (typeof e.data.height !== 'undefined') {
                console.log('height:', 'new:', e.data.height, 'old:', height, 'issame:', e.data.height === height)
                setHeight(e.data.height)
            }
        }
    }, [])

    return (
        <iframe
            ref={setRef}
            title="Preview"
            width="100%"
            height={height}
            className="transition-all"
            // sandbox="allow-popups-to-escape-sandbox allow-scripts allow-popups allow-forms allow-pointer-lock allow-top-navigation allow-modals"
            srcDoc={`
                <!DOCTYPE html>
                 <html>
                  <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <script type="text/javascript" src="https://unpkg.com/tailwindcss-jit-cdn"></script>

                    <script type="text/javascript">
                        window.addEventListener('load', (e) => {
                            var height = 0;
                            setInterval(function () {
                                var body = document.body, html = document.documentElement;
                                var newHeight = Math.max( body.scrollHeight, body.offsetHeight, html.offsetHeight );

                                if (height !== newHeight) {
                                    window.top.postMessage({'height': newHeight}, '*');
                                    newHeight = height;
                                }
                            }, 100);
                        });
                    </script>
                  </head>
                  <body>
                  </body>
                 </html>
            `}
            {...props}
        >
            {mountNode && createPortal(children, mountNode)}
        </iframe>
    )
}

// nord based color theme
const nordTheme = {
    plain: {
        color: '#ECEFF4',
        backgroundColor: '#2E3440',
        // fontSize: '0.9rem',
        lineHeight: 1.35,
        width: 'fit-content',
        minWidth: '100%',
        whiteSpace: 'pre',
        fontFamily: 'Consolas, "Courier New", monospace',
        letterSpacing: '-0.05em',
        // borderRadius: '.25rem',
    },
    styles: [{
        types: ['prolog', 'comment', 'doctype', 'cdata'],
        style: { color: '#636f88' }
    }, {
        types: ['tag', 'class-name'],
        style: { color: '#8FBCBB' }
    }, {
        types: ['property', 'parameter', 'spread', 'number', 'constant', 'symbol', 'atrule', 'attr-value', 'keyword'],
        style: { color: '#81A1C1' }
    }, {
        types: ['attr-value'],
        style: { color: '#E5E9F0' }
    }, {
        types: ['attr-name', 'string', 'char', 'builtin', 'insterted'],
        style: { color: '#A3BE8C' }
    }, {
        types: ['entity', 'deleted', 'url', 'string', 'variable', 'language-css'],
        style: { color: '#5E81AC' }
    }, {
        types: ['function', 'boolean', 'important', 'bold', 'regex', 'important'],
        style: { color: "#EBCB8B" }
    }, {
        types: ['punctuation', 'symbol'],
        style: { color: '#D08770', opacity: '0.6' }
    }, {
        types: ['operator'],
        style: { color: '#D08770' }
    }, {
        types: ['italic'],
        style: { fontStyle: 'italic' }
    }]
}

// convert
const importToRequire = (code) => code
    // { a as b } => { a: b }
    .replace(/([0-9a-z_$]+) as ([0-9a-z_$]+)/gi, '$1: $2')
    // import { a } from "a" => const { a } = require("b")
    .replace(
        /import {([^}]+)} from ([^\s;]+);?/g,
        'const {$1} = require($2);',
    )
    // import a from "a" => const a = require("a").default || require("a")
    .replace(
        /import ([\S]+) from ([^\s;]+);?/g,
        'const $1 = require($2).default || require($2);',
    )
    // import * as a from "a"
    .replace(
        /import \* as ([\S]+) from ([^\s;]+);?/g,
        'const $1 = require($2);',
    )
    // import a from "a" => const a = require("a").default || require("a")
    .replace(
        /import (.+),\s?{([^}]+)} from ([^\s;]+);?/g,
        [
            'const $1 = require($3).default || require($3);',
            'const {$2} = require($3);',
        ].join('\n'),
    )

const globalModules = {
    react: 'React'
}

const req = (path) => {
    // localize the components
    path = path.replace(/\@\/components\//gi, './')

    // get global included module or try loading something from local
    let dep = globalModules[path] || (globalModules[path] = dynamic(() => import(`${path}`), { ssr: false }))

    if (!dep) {
        throw new Error(
            `Unable to resolve path to module '${path}'.`,
        )
    }

    return dep
}

const sizes = [
    ['Mobile (480px)', 640],
    ['Mobile (640px)', 640],
    ['Tablet (768px)', 768],
    ['Laptop (1024px)', 1024],
    ['Desktop (1280px)', 1280],
    ['Desktop (1536px)', 1536]
]

const PreviewWindow = () => {
    const [size, setSize] = useState(-1)
    const [fullScreen, setFullScreen] = useState(false)

    const handleResize = (e) => {
        e.preventDefault()

        if (sizes.length - 1 > size) {
            setSize(size + 1)
        } else {
            setSize(-1)
        }
    }

    const handleFullScreen = (e) => {
        e.preventDefault()

        setFullScreen(!fullScreen)
    }

    return (
        <div className={(fullScreen ? "absolute bottom-0 left-0 right-0 z-20" : "") + " flex flex-col bg-gray-100"} style={fullScreen ? { top: 56, height: 'calc(100vh - 56px)' } : {}}>
            <div className={(fullScreen ? "sticky top-0 left-0 right-0 bg-gray-300" : " bg-gray-100") + " flex items-center gap-2 p-2 rounded transition-all select-none"}>
                <h3><span className="block -mb-3 text-sm font-medium">Preview:</span></h3>

                <div className="flex-grow"></div>

                <div className="flex items-center gap-2">
                    <span className="font-light">{size >= 0 ? sizes[size][0] : 'Set View:'}</span>
                    <a title="Resize Preview Window" className="bg-white rounded cursor-pointer group" onClick={handleResize}>
                        <svg className="w-8 h-8 fill-gray-400 group-hover:fill-gray-500" viewBox="-5 -5 34 34" strokeWidth="0"><path fillRule="evenodd" clipRule="evenodd" d="M6 8H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V4a2 2 0 00-2-2H8a2 2 0 00-2 2v4zm14-4.5H8a.5.5 0 00-.5.5v4H10a2 2 0 012 2v10c0 .173-.022.34-.063.5H20a.5.5 0 00.5-.5V4a.5.5 0 00-.5-.5zm-10 17a.5.5 0 00.5-.5V10a.5.5 0 00-.5-.5H4a.5.5 0 00-.5.5v10a.5.5 0 00.5.5h6z"></path></svg>
                    </a>
                </div>

                <div className="flex items-center">
                    <a title="Toggle Fullscreen" className="flex items-center justify-center w-8 h-8 bg-white rounded cursor-pointer group" onClick={handleFullScreen}>
                        {fullScreen ?
                            <svg className="justify-center w-6 h-6 text-gray-400 bg-white stroke-current group-hover:text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                <polyline points="5 9 9 9 9 5" />
                                <line x1="3" y1="3" x2="9" y2="9" />
                                <polyline points="5 15 9 15 9 19" />
                                <line x1="3" y1="21" x2="9" y2="15" />
                                <polyline points="19 9 15 9 15 5" />
                                <line x1="15" y1="9" x2="21" y2="3" />
                                <polyline points="19 15 15 15 15 19" />
                                <line x1="15" y1="15" x2="21" y2="21" />
                            </svg>
                            :
                            <svg className="justify-center w-6 h-6 text-gray-400 bg-white stroke-current group-hover:text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                <polyline points="16 4 20 4 20 8" />
                                <line x1="14" y1="10" x2="20" y2="4" />
                                <polyline points="8 20 4 20 4 16" />
                                <line x1="4" y1="20" x2="10" y2="14" />
                                <polyline points="16 20 20 20 20 16" />
                                <line x1="14" y1="14" x2="20" y2="20" />
                                <polyline points="8 4 4 4 4 8" />
                                <line x1="4" y1="4" x2="10" y2="10" />
                            </svg>
                        }
                    </a>
                </div>
            </div>

            <div className={(fullScreen ? "" : "") + " overflow-auto"} style={fullScreen ? { top: 56, height: 'calc(100vh - 56px - 48px)' } : {}}>
                <div className='mx-auto transition-all' style={size >= 0 ? { width: sizes[size][1], maxWidth: sizes[size][1], minWidth: sizes[size][1], } : { width: 'auto', maxWidth: 'auto' }}>
                    <IFrame>
                        <div className="flex items-center justify-center h-full p-8 overflow-auto bg-gray-100">
                            <div className="max-w-screen-lg p-8 mx-auto">
                                <LivePreview className="h-full" />
                            </div>
                        </div>
                    </IFrame>
                </div>
            </div>
        </div>
    )
}

const Code = ({ children, className = "language-markup", live = false, noInline = false }) => {
    const language = className.replace(/language-/, '')

    if (live) {
        const id = '_' + Math.random().toString(36).substr(2, 9)
        return (
            <div className="">
                <LiveProvider
                    theme={nordTheme}
                    code={children.trim()}
                    transformCode={(code) => `/* @jsx mdx */ ${importToRequire(code)}`}
                    // transformCode={code => `/** @jsx mdx */ ${code}`}
                    live={live}
                    lang={language}
                    noInline={noInline}
                    scope={{ mdx, require: req, forwardRef, useState, useEffect, useReducer, useRef }}
                >
                    <div className="flex flex-col gap-4 text-gray-600">
                        <h3><span className="block p-2 -mb-3 text-sm font-medium bg-gray-100 rounded">Live Editor:</span></h3>
                        <div className="overflow-auto bg-white rounded max-h-1/2">
                            <LiveEditor />
                        </div>

                        <PreviewWindow />
                    </div>
                    <LiveError />
                </LiveProvider>
            </div>
        )
    }

    return (
        <div className="overflow-auto rounded">
            <Highlight {...defaultProps} theme={nordTheme} code={children.trim()} language={language}>
                {({ className, style, tokens, getLineProps, getTokenProps }) => (
                    <pre className={className} style={{ ...style, padding: '0.5rem' }}>
                        {tokens.map((line, i) => (
                            <div key={i} {...getLineProps({ line, key: i })}>
                                {/* <span style={{ display: 'inline-block', width: '2em', userSelect: 'none', opacity: .3 }}>{i + 1}</span> */}
                                {line.map((token, key) => (
                                    <span key={key} {...getTokenProps({ token, key })} />
                                ))}
                            </div>
                        ))}
                    </pre>
                )}
            </Highlight>
        </div>
    )
}

export default Code
