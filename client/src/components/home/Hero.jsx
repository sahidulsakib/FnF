import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="hero min-h-[80vh]">
      <div className="hero-content text-center">
        <div className="max-w-3xl">

          <h1 className="text-5xl md:text-7xl font-extrabold">
            Stay Connected <br />
            With Your Family
          </h1>

          <p className="py-8 text-lg text-base-content/70">
            Private chats, group conversations, photo sharing and
            real-time communication — all in one place.
          </p>

          <div className="flex justify-center gap-4">

            <Link
              to="/register"
              className="btn btn-primary"
            >
              Get Started
            </Link>

            <Link
              to="/login"
              className="btn btn-outline"
            >
              Login
            </Link>

          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;