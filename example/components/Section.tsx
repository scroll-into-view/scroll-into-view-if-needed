export interface SectionProps {
  children: React.ReactNode
}

const Section: React.StatelessComponent<SectionProps> = ({ children }) => (
  <section>
    <style jsx>{`
      section {
        text-align: center;
      }
    `}</style>
    {children}
  </section>
)

export default Section
