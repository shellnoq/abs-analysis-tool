
# ABS Analysis Tool

A web application for cash flow analysis in securitization, featuring calculation and optimization of ABS structures.

## Features

* Upload and process cash flow data from Excel files
* Configure and calculate ABS tranche parameters
* Optimize ABS structure for maximum efficiency
* Visualize results with interactive charts

## Technology Stack

* **Backend** : FastAPI (Python)
* **Frontend** : React.js
* **Containerization** : Docker
* **Data Processing** : Pandas, NumPy
* **Visualization** : Recharts
* **UI Framework** : Material-UI

## Getting Started

### Prerequisites

* Docker and Docker Compose
* Git

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/abs-analysis-tool.git
cd abs-analysis-tool
```

2. Create the project structure:

```bash
mkdir -p backend/app/models backend/app/routers backend/app/services backend/app/utils
mkdir -p frontend/src/components/calculation frontend/src/components/optimization frontend/src/services frontend/src/contexts frontend/src/pages
```

3. Copy all the files to their respective directories based on the file structure provided.
4. Start the application using Docker Compose:

```bash
docker-compose up
```

5. Access the application:
   * Frontend: http://localhost:3000
   * Backend API: http://localhost:8000

## Development

### Backend Development

1. Navigate to the backend directory:

```bash
cd backend
```

2. Create a virtual environment and install dependencies:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. Run the FastAPI server:

```bash
uvicorn app.main:app --reload
```

### Frontend Development

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install Node.js dependencies:

```bash
npm install
```

3. Run the React development server:

```bash
npm start
```

## Usage

1. **Upload Data** : Start by uploading an Excel file containing cash flow data with columns for installment dates, principal amounts, and interest amounts.
2. **Calculate Results** : Configure tranche parameters and calculate results for your ABS structure.
3. **Optimize Structure** : Find the optimal ABS structure based on your requirements.

## File Structure

```
abs-analysis-tool/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py         # FastAPI application
│   │   ├── models/         # Data models
│   │   ├── routers/        # API routes
│   │   ├── services/       # Business logic
│   │   └── utils/          # Helper functions
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/                # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── services/       # API client
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Page components
│   │   └── utils/          # Helper functions
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml       # Docker configuration
└── README.md                # This file
```

## Example Excel File Format

The application expects an Excel file with the following columns:

* `installment_date`: The date of each cash flow (DD/MM/YYYY format)
* `principal_amount`: The principal amount for each cash flow
* `interest_amount`: The interest amount for each cash flow

The application will automatically calculate `cash_flow` as the sum of principal and interest.

## License

This project is licensed under the MIT License.
=======
# abs-analysis-tool
Advanced ABS Desing
>>>>>>> 686ed8028f000d387db1c9fd2336fbcfe8a2b280
