import { useState, useEffect, useRef, useCallback } from "react";
import { Users, Store, ShoppingBag, Award, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import "./StatsAndTestimonials.css";

const StatisticsSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [counters, setCounters] = useState({
    users: 0,
    partners: 0,
    orders: 0,
    cities: 0,
  });

  const sectionRef = useRef(null);

  const stats = [
    {
      id: "users",
      icon: Users,
      label: "Happy Customers",
      target: 50000,
      suffix: "+",
    },
    {
      id: "partners",
      icon: Store,
      label: "Partner Shops",
      target: 2500,
      suffix: "+",
    },
    {
      id: "orders",
      icon: ShoppingBag,
      label: "Orders Delivered",
      target: 100000,
      suffix: "+",
    },
    {
      id: "cities",
      icon: Award,
      label: "Cities Served",
      target: 25,
      suffix: "+",
    },
  ];

  const startCountAnimation = useCallback(() => {
    stats.forEach((stat) => {
      const duration = 2000; // 2 seconds
      const steps = 60;
      const stepValue = stat.target / steps;
      const stepTime = duration / steps;

      let currentValue = 0;
      const timer = setInterval(() => {
        currentValue += stepValue;
        if (currentValue >= stat.target) {
          currentValue = stat.target;
          clearInterval(timer);
        }
        setCounters((prev) => ({
          ...prev,
          [stat.id]: Math.floor(currentValue),
        }));
      }, stepTime);
    });
  }, [stats]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
          startCountAnimation();
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [isVisible, startCountAnimation]);

  return (
    <div ref={sectionRef} className="statistics-section">
      <div className="stats-container">
        <h2 className="stats-title">Trusted by Thousands</h2>
        <p className="stats-subtitle">
          Join our growing community of satisfied customers
        </p>
        <div className="stats-grid">
          {stats.map((stat) => {
            const IconComponent = stat.icon;
            return (
              <div key={stat.id} className="stat-card">
                <div className="stat-icon">
                  <IconComponent size={40} />
                </div>
                <div className="stat-number">
                  {counters[stat.id].toLocaleString()}
                  {stat.suffix}
                </div>
                <div className="stat-label">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const TestimonialsSection = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      id: 1,
      name: "Priya Sharma",
      location: "Nagpur, Maharashtra",
      text: "Drovo has completely changed how I shop for groceries. Fresh products delivered right to my door, and the quality is always top-notch. Highly recommend!",
      image:
        "https://images.unsplash.com/photo-1494790108755-2616b2b29cd3?w=150&h=150&fit=crop&crop=face",
    },
    {
      id: 2,
      name: "Rajesh Patel",
      location: "Mumbai, Maharashtra",
      text: "The convenience is unmatched! I can order fresh dairy products and groceries from my favorite local shops without leaving home. Great service!",
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    },
    {
      id: 3,
      name: "Anita Desai",
      location: "Pune, Maharashtra",
      text: "Fast delivery, fresh products, and excellent customer support. Drovo has made my daily shopping so much easier. I'm a customer for life!",
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    },
    {
      id: 4,
      name: "Vikram Singh",
      location: "Indore, Madhya Pradesh",
      text: "Quality products from trusted local shops delivered quickly. The app is user-friendly and the delivery team is professional. Excellent experience!",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [testimonials.length]);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );
  };

  return (
    <div className="testimonials-section">
      <div className="testimonials-container">
        <h2 className="testimonials-title">What Our Customers Say</h2>
        <div className="testimonial-carousel">
          <button className="carousel-btn prev" onClick={prevTestimonial}>
            <ChevronLeft size={24} />
          </button>

          <div className="testimonial-card">
            <div className="quote-icon">
              <Quote size={30} />
            </div>
            <div className="testimonial-content">
              <p className="testimonial-text">
                &ldquo;{testimonials[currentTestimonial].text}&rdquo;
              </p>
              <div className="testimonial-author">
                <img
                  src={testimonials[currentTestimonial].image}
                  alt={testimonials[currentTestimonial].name}
                  className="author-image"
                />
                <div className="author-info">
                  <h4>{testimonials[currentTestimonial].name}</h4>
                  <p>{testimonials[currentTestimonial].location}</p>
                </div>
              </div>
            </div>
          </div>

          <button className="carousel-btn next" onClick={nextTestimonial}>
            <ChevronRight size={24} />
          </button>
        </div>

        <div className="testimonial-dots">
          {testimonials.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === currentTestimonial ? "active" : ""}`}
              onClick={() => setCurrentTestimonial(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const StatsAndTestimonials = () => {
  return (
    <div className="stats-testimonials-wrapper">
      <StatisticsSection />
      <TestimonialsSection />
    </div>
  );
};

export default StatsAndTestimonials;
