import Image from 'next/image';
import Link from 'next/link';

const Brand = () => {
  return (
    <Link
      href="/"
      aria-label="Speckvue Finance home"
      className="inline-flex shrink-0 rounded-lg focus-visible:outline-2 focus-visible:outline-primary-base"
    >
      <Image
        src="/brand/logo-light.svg"
        alt="Speckvue Finance"
        width={438}
        height={48}
        priority
        unoptimized
        className="h-6 w-auto sm:h-7 dark:hidden"
      />
      <Image
        src="/brand/logo-dark.svg"
        alt="Speckvue Finance"
        width={438}
        height={48}
        priority
        unoptimized
        className="hidden h-6 w-auto sm:h-7 dark:block"
      />
    </Link>
  );
};

export default Brand;
