from flask import Flask, request, jsonify, abort, send_from_directory
import BST_DAO as dao

app = Flask(__name__, static_folder='static')

dao.init_db()

REQUIRED_FIELDS = ['first_name', 'surname', 'dob', 'bst_scheme']

def validate_required(data):
    return [f for f in REQUIRED_FIELDS if not data.get(f)]

@app.route('/')
def index():
    return send_from_directory('static', 'BSTApplications.html')

@app.route('/applicants', methods=['GET'])
def get_all():
    return jsonify(dao.get_all())

@app.route('/applicants/offers', methods=['GET'])
def get_offers():
    return jsonify(dao.get_offers())

@app.route('/applicants/acceptances', methods=['GET'])
def get_acceptances():
    return jsonify(dao.get_acceptances())

@app.route('/applicants/<int:rcppi_id>', methods=['GET'])
def get_one(rcppi_id):
    applicant = dao.get_by_id(rcppi_id)
    if not applicant:
        abort(404)
    return jsonify(applicant)

@app.route('/applicants', methods=['POST'])
def create():
    data = request.get_json()
    missing = validate_required(data or {})
    if missing:
        abort(400, description=f"Missing required fields: {', '.join(missing)}")
    new_id = dao.create(data)
    return jsonify({'rcppi_id': new_id}), 201

@app.route('/applicants/<int:rcppi_id>/interview', methods=['PUT'])
def update_interview(rcppi_id):
    data = request.get_json() or {}
    status = data.get('interview_status')
    if status not in ('completed', 'no_interview', 'withdrawn'):
        abort(400, description="interview_status must be completed, no_interview, or withdrawn")
    score = data.get('interview_score') if status == 'completed' else None
    rows = dao.update_interview(rcppi_id, status, score)
    if rows == 0:
        abort(404)
    return jsonify({'updated': rows})

@app.route('/applicants/assign-offers', methods=['POST'])
def assign_offers():
    total = dao.assign_offers()
    return jsonify({'offers_assigned': total})

@app.route('/applicants/<int:rcppi_id>/acceptance', methods=['PUT'])
def update_acceptance(rcppi_id):
    data = request.get_json() or {}
    acceptance = data.get('acceptance')
    if acceptance not in ('accepted', 'refused'):
        abort(400, description="acceptance must be 'accepted' or 'refused'")
    rows = dao.update_acceptance(rcppi_id, acceptance)
    if rows == 0:
        abort(404)
    return jsonify({'updated': rows})

@app.route('/applicants/<int:rcppi_id>', methods=['DELETE'])
def delete(rcppi_id):
    rows = dao.delete(rcppi_id)
    if rows == 0:
        abort(404)
    return jsonify({'deleted': rows})

if __name__ == '__main__':
    app.run(debug=True)
