/**
 * Menu prices come from CMS-edited JSON as free text, so they aren't
 * always a clean decimal: ranges ("8.50 / 13.50"), prefixed ("from 3.00"),
 * or blank ("Ask at the bar"). Format each case instead of blindly
 * prepending €, which previously produced "€from 3.00" and a bare "€".
 */
function formatMenuPrice(raw) {
  const value = (raw ?? '').toString().trim()
  if (!value) return null

  if (value.includes('/')) {
    return value
      .split('/')
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => `€${part}`)
      .join(' / ')
  }

  const fromMatch = value.match(/^from\s+(.+)$/i)
  if (fromMatch) {
    return `From €${fromMatch[1].trim()}`
  }

  return `€${value}`
}

export function Menu({ venue }) {
  const { menu } = venue
  const canOrder = Boolean(venue.ordering?.enabled)

  return (
    <section id="menu" className="section menu" data-reveal>
      <div className="section__intro">
        <p className="eyebrow">{menu.eyebrow}</p>
        <h2 className="section__title">{menu.title}</h2>
        <p className="section__body">{menu.intro}</p>
        {canOrder ? (
          <p className="menu__order-link">
            <a href="#order">Order pizza for collection →</a>
          </p>
        ) : null}
      </div>

      <div className="menu__sections">
        {menu.sections.map((section) => (
          <div className="menu__section" key={section.id} id={section.id}>
            <h3 className="menu__section-title">{section.name}</h3>
            <ul className="menu__list">
              {section.items.map((item) => {
                const price = formatMenuPrice(item.price)
                return (
                  <li className="menu__item" key={item.name}>
                    <div className="menu__item-main">
                      <span className="menu__item-name">{item.name}</span>
                      {price ? (
                        <span className="menu__item-price" aria-label={price.replace('€', 'euro ')}>
                          {price}
                        </span>
                      ) : null}
                    </div>
                    {item.description ? (
                      <p className="menu__item-desc">{item.description}</p>
                    ) : null}
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
