import { MDXProvider } from "@mdx-js/react"
import fs from 'fs'
import glob from "glob"
import matter from 'gray-matter'
import { MDXRemote } from 'next-mdx-remote'
import { serialize } from 'next-mdx-remote/serialize'
import Head from "next/head"
import Image from "next/image"
import { useRouter } from "next/router"
import path from 'path'
import React, { useEffect, useState } from "react"
import imageSize from "rehype-img-size"
import CodeBlock from '../components/CodeBlock'

const TOP_OFFSET = 56

const components = {
  pre: props => <div {...props} />,
  code: CodeBlock,
  img: (props) => (
    <Image {...props} layout="responsive" loading="lazy" />
  ),
}

export default function DocPage({ content, menu }) {
  const [activeHeader, setActiveHeader] = useState()
  const [headings, setHeadings] = useState([])

  useEffect(() => {
    const scrollHandler = () => {
      if (!headings.length) setHeadings(
        [...document.getElementById('article').getElementsByTagName('h1'), ...document.getElementById('article').getElementsByTagName('h2'), ...document.getElementById('article').getElementsByTagName('h3'), ...document.getElementById('article').getElementsByTagName('h4')]
          .map(el => ({
            bounds: el.getBoundingClientRect(),
            id: el.id || (el.id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)),
            text: el.innerHTML.replace(/<[^>]*>?/gm, ''),
            tagName: el.tagName
          }))
          .sort((a, b) => a.bounds.top > b.bounds.top ? 1 : -1)
      )

      const { scrollHeight, scrollTop } = document.documentElement

      let activeHeaderAnchor = headings.length ? headings[0].text : ''

      for (let heading of headings) {
        const { top } = heading.bounds

        if (top >= 0 && scrollTop + TOP_OFFSET + 20 >= top) {
          activeHeaderAnchor = heading.text
        }
      }

      var scrolledToBottom = (scrollTop + window.innerHeight) >= scrollHeight
      if (scrolledToBottom && headings.length) activeHeaderAnchor = headings[headings.length - 1].text

      if (activeHeaderAnchor !== activeHeader) setActiveHeader(activeHeaderAnchor)
    }

    window.addEventListener('scroll', scrollHandler)

    scrollHandler()

    return () => window.removeEventListener('scroll', scrollHandler)
  })

  let { asPath: path } = useRouter()
  path = path.trim()

  return (
    <>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </Head>

      <div className="flex flex-col min-h-screen bg-white">

        <div className="sticky top-0 left-0 right-0 z-30 flex bg-white border-b shadow-sm h-14">
          <div className="container flex items-center justify-between w-full px-8 mx-auto">
            <div className="flex items-center gap-1">
              <svg className="w-6 h-6 transition-all fill-night-100" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 95.87 83">
                <path d="M54.363 0H1v12h54.012c16.582.027 29.98 13.219 30.011 29.5-.03 16.277-13.43 29.477-30.011 29.5H13V35h39.809c3.308.016 5.992 2.7 5.992 6s-2.684 5.988-5.992 6H36v-5H24v18.012s25.227 0 27.848-.008c9.972 0 17.996-8.074 18.004-18.004-.008-9.91-8.016-17.965-17.965-18L0 24.008 1 83h53.363c22.93-.012 41.504-18.598 41.512-41.508C95.867 18.59 77.293 0 54.363 0m-2.566 23.734c.008 0 .016 0 .02.004.304-.004.128-.004-.02-.004m0 0h-.024.024"></path>
              </svg>

              <span className="text-xl font-medium text-night-300">DPG Live Docs</span>
            </div>

            <nav className="flex md:hidden">
              <label htmlFor="menu" className="flex">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </label>
            </nav>
          </div>
        </div>

        <div className="grid mx-auto md:container md:gap-14 md:grid-cols-site-sm xl:grid-cols-site-lg">
          <input type="checkbox" id="menu" name="menu" className="hidden peer" />

          <div className="flex-col hidden gap-8 px-4 py-4 bg-gray-100 menu md:overflow-y-scroll md:sticky md:py-12 peer-checked:flex md:flex md:bg-white">
            {Object.entries(menu).map(([key, items]) => (
              <div key={key}>
                <h4 className="font-medium text-gray-600 uppercase">{key}</h4>

                <ul className="flex flex-col gap-2 mt-3 text-sm font-medium border-l border-gray-200">
                  {items.map((item, idx) => (
                    <li key={idx} className="-ml-0.5"><a href={item.slug} className={(path === item.slug ? 'border-blue-600 border-l-3' : '') + " pl-3 opacity-75 hover:opacity-100"}>{item.title}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <article className="px-4 py-4 md:py-12">
            <div id="article" className="prose max-w-none">
              <MDXProvider components={components}>
                <MDXRemote {...content} />
              </MDXProvider>
            </div>
          </article>

          <aside className="sticky top-0 hidden py-12 xl:block" style={{ height: 'calc(100vh - 56px)', top: 56 }}>
            <h4 className="text-sm font-medium text-gray-400 uppercase">On this page</h4>
            <ul className="flex flex-col gap-2 mt-2 text-gray-500">
              <ul className="flex flex-col gap-2 mt-2 text-gray-500">
                {headings.map(({ text, id, tagName, bounds }, idx) => (
                  <li key={idx} className={(activeHeader === text ? "pl-1" : "pl-0") + " " + (tagName === "H3" ? "ml-3" : "ml-0") + " " + (tagName === "H4" ? "ml-5" : "ml-0") + " transition-all"}><a href="/" className={(activeHeader === text ? "font-medium text-gray-900" : "") + " transition-all"} onClick={(e) => {
                    e.preventDefault()

                    window.scrollTo({
                      top: bounds.top - TOP_OFFSET - 10,
                      behavior: "smooth",
                      block: 'start'
                    });

                  }}>{text}</a></li>
                ))}
              </ul>
            </ul>
          </aside>
        </div>
      </div>
    </>)
}

const postDocPaths = () => glob.sync(path.resolve('docs', '**', '*.mdx'))

export const getStaticProps = async ({ params }) => {
  if (!params || !params.slug) params = { slug: ["index"] }

  let menu = postDocPaths()
    // get all docs
    .map(file => path.resolve('docs', file))
    // get file details
    .map(file => ({
      ...matter(fs.readFileSync(file)).data,
      slug: file.toLowerCase().replace(path.resolve('docs'), '').replace(/\.mdx$/gi, '').replace(/index$/ig, '')
    }))
    .map(data => {
      const section = data.slug.split('/')[1] || "Guides";

      return ({
        ...data,
        section: section[0].toUpperCase() + section.slice(1)
      })
    })
    // group by the section name
    .reduce((rv, x) => {
      (rv[x.section] = rv[x.section] || []).push(x)
      return rv
    }, {})

  // first sort by title
  Object.keys(menu).map((key) => menu[key].sort((a, b) => a.title > b.title ? -1 : 1))

  // second sort by custom order number
  Object.keys(menu).map((key) => menu[key].sort((a, b) => a.order > b.order ? 1 : -1))

  // unordered
  menu = Object.keys(menu).sort((a, b) => a === 'Guides' ? -1 : (a > b ? 1 : -1)).reduce((obj, key) => {
    obj[key] = menu[key];
    return obj;
  }, {});

  params.slug[params.slug.length - 1] += '.mdx'

  let { content, data } = matter(fs.readFileSync(path.resolve('docs', ...params.slug)))

  content = await serialize(content, {
    scope: data,
    mdxOptions: {
      rehypePlugins: [[imageSize, { dir: "public" }]],
    },
  })

  return {
    props: {
      content,
      menu
    },
  }
}

export const getStaticPaths = async () => {
  // get all doc paths
  let paths = postDocPaths()
    // create slugs from file paths
    .map(file => ({ params: { slug: file.toLowerCase().replace(path.resolve('docs'), '').replace(/\.mdx$/gi, '').replace(/index$/ig, '').slice(1).split('/') } }))

  return {
    paths,
    fallback: false,
  }
}
