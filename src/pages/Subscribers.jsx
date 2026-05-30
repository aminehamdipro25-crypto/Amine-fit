export default function LegacySubscribers() { return null }
export const getServerSideProps = () => ({ redirect: { destination: '/dashboard/subscribers', permanent: true } })
