import { useNavigate } from "react-router-dom";

function FrontPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-indigo-900 via-purple-800 to-indigo-900 text-white p-6">
      <div className="bg-white/10 backdrop-blur-md p-10 rounded-3xl shadow-2xl max-w-xl w-full text-center border border-white/20">
        <h1 className="text-5xl font-extrabold mb-6 tracking-wide drop-shadow-lg">
          OS Algorithm Simulator
        </h1>
        <p className="text-lg mb-10 text-white/80">
          Choose an algorithm simulator to get started
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <button
            onClick={() => navigate("/cpu-scheduling")}
            className="py-4 px-6 bg-blue-600 hover:bg-blue-700 transition-all duration-300 rounded-xl text-lg font-semibold shadow-lg hover:scale-105"
          >
            CPU Scheduling
          </button>

          <button
            onClick={() => navigate("/disk-simulator")}
            className="py-4 px-6 bg-green-600 hover:bg-green-700 transition-all duration-300 rounded-xl text-lg font-semibold shadow-lg hover:scale-105"
          >
            Disk Simulator
          </button>
        </div>
      </div>
    </div>
  );
}

export default FrontPage;
