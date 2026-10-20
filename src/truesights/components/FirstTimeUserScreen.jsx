import React from 'react';
import Icon from '../design-system/icons';

export default function FirstTimeUserScreen({
  onCreateProject,
  onLoadSampleProject,
  onBackToDashboard
}) {
  const starterTemplates = [
    {
      id: 'template-autonomous',
      title: 'Autonomous Systems & Robotics Control',
      level: 'POST GRADUATE',
      duration: '4 Weeks',
      modules: 5,
      coverImage: '/assets/book-building.jpg',
      description: 'Kalman filters, SLAM navigation, ROS2 nodes, and path planning algorithms.'
    },
    {
      id: 'template-nuclear',
      title: 'Nuclear Fission & Reactor Dynamics',
      level: 'CORE PHYSICS',
      duration: '5 Weeks',
      modules: 5,
      coverImage: '/assets/book-nuclear-fission.jpg',
      description: 'Binding energy, neutron moderation, thermal reactors, and safety protocols.'
    },
    {
      id: 'template-cyber',
      title: 'Cybersecurity CTF & Reverse Engineering',
      level: 'HANDS-ON LAB',
      duration: '3 Weeks',
      modules: 4,
      coverImage: '/assets/book-ctf.jpg',
      description: 'Binary exploitation, buffer overflows, x86 disassembly, and network forensics.'
    }
  ];

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        maxHeight: '100%',
        boxSizing: 'border-box',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        paddingRight: '6px',
        fontFamily: 'var(--font-primary, "Plus Jakarta Sans", sans-serif)'
      }}
    >
      {/* Top Header Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
              Get Started
            </h1>
            <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: '#64748B' }}>
              Welcome to TrueSights · Your personalized learning roadmap system
            </p>
          </div>
        </div>

        {onCreateProject && (
          <button
            type="button"
            onClick={onCreateProject}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#0B3A6F',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '9px',
              padding: '8px 18px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(11, 58, 111, 0.2)'
            }}
          >
            <Icon name="plus" size={14} color="#FFFFFF" />
            <span>Create New Project</span>
          </button>
        )}
      </div>

      {/* Main Hero Card: Clean & Direct */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          padding: '40px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)'
        }}
      >
        {/* Hero Illustration */}
        <div
          style={{
            width: '240px',
            height: '180px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}
        >
          <img
            src="/assets/first-project.png"
            alt="Your first project starts here"
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              filter: 'drop-shadow(0 8px 16px rgba(15, 23, 42, 0.06))'
            }}
          />
        </div>

        {/* Title & Description */}
        <div style={{ maxWidth: '520px', marginBottom: '24px' }}>
          <h2
            style={{
              fontSize: '24px',
              fontWeight: 700,
              color: '#0F172A',
              margin: '0 0 10px 0',
              letterSpacing: '-0.02em'
            }}
          >
            Your first project starts here
          </h2>
          <p
            style={{
              fontSize: '14px',
              lineHeight: '1.6',
              color: '#64748B',
              margin: 0
            }}
          >
            Turn any syllabus, textbook chapter, or research topic into a guided roadmap. TrueSights breaks down complex concepts into bite-sized learning modules, interactive live challenges, and verified completion credentials.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={onCreateProject}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#0B3A6F',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '10px',
              padding: '11px 24px',
              fontSize: '13.5px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(11, 58, 111, 0.22)',
              transition: 'background-color 150ms ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#082B53')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0B3A6F')}
          >
            <Icon name="plus" size={15} color="#FFFFFF" />
            <span>Create Your First Project</span>
          </button>

          <button
            type="button"
            onClick={() => onLoadSampleProject && onLoadSampleProject(starterTemplates[0])}
            style={{
              backgroundColor: '#FFFFFF',
              color: '#334155',
              border: '1px solid #CBD5E1',
              borderRadius: '10px',
              padding: '11px 20px',
              fontSize: '13.5px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 150ms ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#F8FAFC';
              e.currentTarget.style.borderColor = '#94A3B8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FFFFFF';
              e.currentTarget.style.borderColor = '#CBD5E1';
            }}
          >
            Load Starter Roadmap
          </button>
        </div>
      </div>

      {/* Starter Templates Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>
              Or start with a curated academic template
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748B' }}>
              Pre-structured by university faculty with syllabus learning objectives
            </p>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '14px'
          }}
        >
          {starterTemplates.map((template) => (
            <div
              key={template.id}
              onClick={() => onLoadSampleProject && onLoadSampleProject(template)}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                border: '1px solid #E2E8F0',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                cursor: 'pointer',
                transition: 'all 160ms ease',
                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.02)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#0B3A6F';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(11, 58, 111, 0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E2E8F0';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(15, 23, 42, 0.02)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span
                  style={{
                    backgroundColor: '#EFF6FF',
                    color: '#1D4ED8',
                    fontSize: '10.5px',
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: '5px'
                  }}
                >
                  {template.level}
                </span>
                <span style={{ fontSize: '11px', color: '#64748B' }}>
                  {template.modules} Modules · {template.duration}
                </span>
              </div>

              <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', lineHeight: '1.3' }}>
                {template.title}
              </div>

              <p style={{ margin: 0, fontSize: '12px', color: '#64748B', lineHeight: '1.4', flex: 1 }}>
                {template.description}
              </p>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#0B3A6F',
                  fontSize: '12px',
                  fontWeight: 700,
                  marginTop: '4px'
                }}
              >
                <span>Select Template</span>
                <Icon name="arrowRight" size={12} color="#0B3A6F" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
