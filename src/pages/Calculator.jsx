export default function LegacyCalculator() { return null }
export const getServerSideProps = () => ({ redirect: { destination: '/dashboard/calculator', permanent: true } })
