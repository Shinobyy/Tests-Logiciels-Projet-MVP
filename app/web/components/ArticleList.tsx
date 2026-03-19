import { Article } from '@/types/base'
import Link from 'next/link'

function ArticleList({ articles }: { readonly articles: Article[]}) {
    return (
        <div className="space-y-1">
            {articles.map((article) => (
                <div
                    key={article.id}
                    className="grid grid-cols-[1fr_140px_130px_120px] items-center gap-2 rounded-sm border border-[#4f5341] px-2 py-2 odd:bg-[#242921] even:bg-[#2b3128]"
                >
                    <div className="flex min-w-0 items-center gap-2">
                        <div className="h-8 w-8 shrink-0 rounded-sm border border-[#5c624d] bg-[#181c15] p-0.5 shadow-inner">
                            <img src={article.image} alt={article.titre} className="h-full w-full rounded-sm object-cover" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="truncate text-sm font-bold text-[#d7ee2d]">{article.titre}</h2>
                            <p className="truncate text-xs text-[#bcc1a2]">{article.user?.pseudonym}</p>
                        </div>
                    </div>

                    <div className="min-w-0">
                        <p className="truncate text-sm text-[#d6d6c4]">
                            {article.categories[0] ?? '-'}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-[#d6d6c4]">{new Date(article.published_at).toLocaleDateString()}</p>
                    </div>

                    <div className="text-right">
                        <Link
                            href={`/articles/${article.id}`}
                            className="dofus-btn inline-block px-3 py-1 text-xs"
                        >
                            Echanger
                        </Link>
                    </div>
                </div>
            ))}

            {articles.length === 0 && (
                <p className="dofus-panel text-sm font-bold text-[#c8cbad]">
                    Aucun article disponible pour le moment.
                </p>
            )}
        </div>
)
}

export default ArticleList