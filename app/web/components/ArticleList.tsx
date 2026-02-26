import { Article } from '@/types/base'

function ArticleList({ articles }: { readonly articles: Article[]}) {
    return (
        <div>
            {articles.map((article) => (
                <div key={article.id}>
                    {article.categories.map((category) => (
                        <span key={category}>{category}</span>
                    ))}
                    <div>
                        <img src={article.image} alt={article.titre} />
                    </div>
                    <div>
                        <h2>{article.titre}</h2>
                        <p>{article.description}</p>
                        <p>Livre publié le {article.published_at}</p>
                    </div>

                    <div>
                        <p>
                            Proposé par
                            {article.user?.pseudonym}
                        </p>
                        <img src={article.user?.avatar} alt={article.user?.pseudonym} />
                    </div>

                </div>
            ))}

            {articles.length === 0 && (
                <p>Aucun article disponible pour le moment.</p>
            )}
        </div>
)
}

export default ArticleList