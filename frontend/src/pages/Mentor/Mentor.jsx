import { useState } from "react";
import { Loader } from "lucide-react";

export default function FundingForm() {
  const [formData, setFormData] = useState({
    title: "",
    domain: "",
    expectedFund: "",
    equity: "",
    profitMargin: "",
    scalability: "",
    costOfOperation: "",
    marketCompetition: "",
    founderExperience: "",
    ideaInnovation: "",
  });

  const [loading, setLoading] = useState(false);
  const [successRate, setSuccessRate] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const calculateSuccessRate = () => {
    const profitMargin = parseFloat(formData.profitMargin) || 0;
    const scalability = parseFloat(formData.scalability) || 1;
    const expectedFund = parseFloat(formData.expectedFund) || 0;
    const costOfOperation = parseFloat(formData.costOfOperation) || 1;
    const equity = parseFloat(formData.equity) || 0;
    const marketCompetition = formData.marketCompetition;
    const founderExperience = formData.founderExperience;
    const ideaInnovation = formData.ideaInnovation;

    let success = 50; // Base success rate starts at 50%

    // ✅ Equity (Higher is better)
    if (equity > 60) success += 20;
    else if (equity < 15) success -= 15;

    // ✅ Profit Margin (Higher is better)
    if (profitMargin > 50) success += 20;
    else if (profitMargin < 10) success -= 20;

    // ✅ Funding vs Cost of Operation
    if (expectedFund >= costOfOperation * 4) success += 20;
    else if (expectedFund < costOfOperation) success -= 25;

    // ✅ Scalability
    if (scalability > 8) success += 15;
    else if (scalability < 4) success -= 10;

    // ✅ Market Competition
    if (marketCompetition === "high") success -= 15;
    else if (marketCompetition === "low") success += 10;

    // ✅ Founder Experience
    if (founderExperience === "experienced") success += 15;
    else if (founderExperience === "first-time") success -= 10;

    // ✅ Idea Innovation
    if (ideaInnovation === "unique") success += 15;
    else if (ideaInnovation === "common") success -= 10;

    // Ensure success rate is between 5% and 98%
    success = Math.min(Math.max(success, 5), 98);

    return success.toFixed(2);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessRate(null);

    setTimeout(() => {
      setLoading(false);
      const rate = calculateSuccessRate();
      setSuccessRate(rate);
    }, 1000); // 20 seconds delay
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-lg bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-center text-green-700">Startup Success Predictor</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title Input */}
          <div>
            <label className="block font-medium">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Dropdowns */}
          {[
            { label: "Market Competition", name: "marketCompetition", options: ["low", "medium", "high"] },
            { label: "Founder Experience", name: "founderExperience", options: ["experienced", "first-time"] },
            { label: "Idea Innovation", name: "ideaInnovation", options: ["unique", "common"] },
          ].map(({ label, name, options }) => (
            <div key={name}>
              <label className="block font-medium">{label}</label>
              <select
                name={name}
                value={formData[name]}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select</option>
                {options.map((option) => (
                  <option key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</option>
                ))}
              </select>
            </div>
          ))}

          {/* Other Inputs */}
          {[
            { label: "Expected Fund (₹)", name: "expectedFund" },
            { label: "Equity (%)", name: "equity" },
            { label: "Profit Margin (%)", name: "profitMargin" },
            { label: "Scalability (1-10)", name: "scalability" },
            { label: "Cost of Operation (₹)", name: "costOfOperation" }
          ].map(({ label, name }) => (
            <div key={name}>
              <label className="block font-medium">{label}</label>
              <input
                type="number"
                name={name}
                value={formData[name]}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          ))}

          {/* Submit Button with Spinner */}
          <button
            type="submit"
            className="w-full bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition"
            disabled={loading}
          >
            {loading ? (
              <div className="flex justify-center items-center">
                <Loader className="h-5 w-5 animate-spin mr-2" />
                Calculating...
              </div>
            ) : (
              "Enter"
            )}
          </button>
        </form>

        {/* Success Rate Display */}
        {successRate !== null && (
          <div className="mt-6 text-center">
            <h3 className="text-xl font-semibold text-green-700">
              Estimated Startup Success Rate: <span className="text-green-600">{successRate}%</span>
            </h3>
          </div>
        )}
      </div>
    </div>
  );
}
