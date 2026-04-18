export default function University() {
  const courses = [
    {
      level: "Beginner",
      title: "Trading Fundamentals",
      description: "Learn the basics of forex trading, including market structure, order types, and risk management.",
      duration: "2 hours",
      lessons: 8,
    },
    {
      level: "Intermediate",
      title: "Technical Analysis Mastery",
      description: "Master chart patterns, indicators, and price action analysis for better trade timing.",
      duration: "4 hours",
      lessons: 12,
    },
    {
      level: "Advanced",
      title: "Algorithmic Trading",
      description: "Build automated trading systems and understand quantitative strategies.",
      duration: "6 hours",
      lessons: 16,
    },
  ];

  return (
    <div className="page-section">
      <section className="card university-header">
        <div className="section-header">
          <div>
            <p className="eyebrow">Trading University</p>
            <h3>Master the Markets</h3>
          </div>
        </div>
        <p className="university-description">
          Access comprehensive trading education designed for serious traders. From basics to advanced strategies.
        </p>
      </section>

      <div className="courses-grid">
        {courses.map((course, idx) => (
          <section key={idx} className="card course-card">
            <div className="course-level">{course.level}</div>
            <h3>{course.title}</h3>
            <p>{course.description}</p>
            <div className="course-meta">
              <span>{course.duration}</span>
              <span>{course.lessons} lessons</span>
            </div>
            <button className="secondary-button" type="button">
              Start Course
            </button>
          </section>
        ))}
      </div>
    </div>
  );
}