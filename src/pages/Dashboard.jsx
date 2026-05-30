// Legacy file — use /dashboard instead
export default function LegacyDashboard() { return null }
export const getServerSideProps = () => ({ redirect: { destination: '/dashboard', permanent: true } })
