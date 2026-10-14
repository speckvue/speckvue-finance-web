const LegalPlaceholder = ({ title }: { title: string }) => {
  return (
    <article className="max-w-2xl">
      <p className="text-xs font-medium tracking-widest text-orange-800 uppercase dark:text-orange-300">
        Draft placeholder · Not an approved policy
      </p>
      <h1 className="mt-4 text-3xl font-semibold">{title}</h1>
      <p className="mt-6 text-base leading-7 text-text-sub-600">
        This page is reserved for Speckvue Finance’s reviewed{' '}
        {title.toLowerCase()}. Approved policy content has not been provided.
      </p>
      <p className="mt-4 text-sm leading-6 text-text-sub-600">
        Before launch, confirm actual data processing, retention, service
        providers, user rights, and applicable regional requirements with
        qualified reviewers.
      </p>
    </article>
  );
};

export default LegalPlaceholder;
