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
              {section.items.map((item) => (
                <li className="menu__item" key={item.name}>
                  <div className="menu__item-main">
                    <span className="menu__item-name">{item.name}</span>
                    <span className="menu__item-price" aria-label={`${item.price} euro`}>
                      €{item.price}
                    </span>
                  </div>
                  {item.description ? (
                    <p className="menu__item-desc">{item.description}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
