function PageState({ title, message, action }) {
    return (
        <section className="page-state">
            <h2>{title}</h2>
            {message && <p>{message}</p>}
            {action}
        </section>
    );
}

export default PageState;
